'use strict';

require('co-mocha');
const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

const assert = require('assert');
const Mongolass = require('mongolass');
const mongolass = new Mongolass(MONGODB);

const User = mongolass.model('User');

User.plugin('POPULATE', require('./index'));

describe('mongolass-plugin-populate', function () {
  before(function* () {
    yield mongolass.model('User').create({ _id: 1, name: 'aaa', age: 1 });
    yield mongolass.model('User').create({ _id: 2, name: 'bbb', age: 2 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('No `path` or `model`', function* () {
    try {
      yield User.find().POPULATE({ path: '_id' });
    } catch(e) {
      assert.deepEqual(e.message, 'No .pouplate path or model');
    }

    try {
      yield User.find().POPULATE({ model: 'User' });
    } catch(e) {
      assert.deepEqual(e.message, 'No .pouplate path or model');
    }
  });

  it('`null` not populate', function* () {
    const users = yield User.find({ _id: 3 }).POPULATE({ path: '_id', model: 'User' });
    assert.deepEqual(users, []);

    const user = yield User.findOne({ _id: 3 }).POPULATE({ path: '_id', model: 'User' });
    assert.deepEqual(user, null);
  });

  it('normal', function* () {
    let users = yield User.find().POPULATE({ path: '_id', model: 'User' });
    assert.deepEqual(users, [
      { _id: { _id: 1, name: 'aaa', age: 1 }, name: 'aaa', age: 1 },
      { _id: { _id: 2, name: 'bbb', age: 2 }, name: 'bbb', age: 2 }
    ]);

    users = yield User.find().POPULATE({ path: '_id', model: User });
    assert.deepEqual(users, [
      { _id: { _id: 1, name: 'aaa', age: 1 }, name: 'aaa', age: 1 },
      { _id: { _id: 2, name: 'bbb', age: 2 }, name: 'bbb', age: 2 }
    ]);
  });

  it('`select` opt', function* () {
    let users = yield User
      .find()
      .select({ age: 1 })
      .POPULATE({ path: '_id', select: { _id: 0 }, model: 'User' });
    assert.deepEqual(users, [
      { _id: { name: 'aaa', age: 1 }, age: 1 },
      { _id: { name: 'bbb', age: 2 }, age: 2 }
    ]);

    users = yield User
      .findOne()
      .POPULATE({ path: '_id', select: { _id: 0, name: 1 }, model: User });
    assert.deepEqual(users, { _id: { name: 'aaa' }, name: 'aaa', age: 1 });
  });

  it('`match` opt', function* () {
    let users = yield User
      .find()
      .select({ name: 1 })
      .POPULATE({ path: '_id', match: { name: 'bbb' }, select: { age: 1 }, model: 'User' });
    assert.deepEqual(users, [
      { _id: 1, name: 'aaa' },
      { _id: { _id: 2, age: 2 }, name: 'bbb' }
    ]);

    users = yield User
      .find()
      .select({ name: 1 })
      .POPULATE({ path: '_id', match: { name: 'xxx' }, select: { age: 1 }, model: 'User' });
    assert.deepEqual(users, [
      { _id: 1, name: 'aaa' },
      { _id: 2, name: 'bbb' }
    ]);
  });

  it('no `path` or `model` found in results then not populate', function* () {
    let users = yield User.find().select({ _id: 0 }).POPULATE({ path: '_id', model: 'User' });
    assert.deepEqual(users, [
      { name: 'aaa', age: 1 },
      { name: 'bbb', age: 2 }
    ]);

    users = yield User.find().POPULATE({ path: '_id', model: 'User2' });
    assert.deepEqual(users, [
      { _id: 1, name: 'aaa', age: 1 },
      { _id: 2, name: 'bbb', age: 2 }
    ]);
  });

  it('deep populate', function* () {
    let users = yield User
      .find()
      .select({ name: 1 })
      .POPULATE({ path: '_id', select: { age: 1 }, model: 'User' })
      .populate({ path: '_id._id', select: { _id: 0 }, model: User });
    assert.deepEqual(users, [
      { _id: { _id: { name: 'aaa', age: 1 }, age: 1 }, name: 'aaa' },
      { _id: { _id: { name: 'bbb', age: 2 }, age: 2 }, name: 'bbb' }
    ]);

    users = yield User
      .find()
      .select({ name: 1 })
      .POPULATE({ path: '_id', select: { age: 1 }, model: 'User' })
      .populate({ path: '_id._id', match: { name: 'aaa' }, model: User });
    assert.deepEqual(users, [
      { _id: { _id: { _id: 1, name: 'aaa', age: 1 }, age: 1 }, name: 'aaa' },
    ]);
  });
});
