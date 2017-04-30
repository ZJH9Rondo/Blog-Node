'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

const assert = require('assert');
const Mongolass = require('..');
const mongolass = new Mongolass(MONGODB);

const User = mongolass.model('User');
User.plugin('oops', {
  afterFind: function () {
    throw new Error('oops');
  }
});

describe('query.js', function () {
  before(function* () {
    yield mongolass.model('User').insertOne({ name: 'aaa', age: 2 });
    yield mongolass.model('User').insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('exec', function* () {
    let error;
    let users = yield User.find().select({ _id: 0 }).exec();
    assert.deepEqual(users, [ { name: 'aaa', age: 2 }, { name: 'bbb', age: 1 } ]);

    try {
      yield User.find().select({ _id: 0 }).oops().exec();
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error, {
      model: 'User',
      plugin: 'oops',
      type: 'afterFind',
      args: [],
      result: [
        { name: 'aaa', age: 2 },
        { name: 'bbb', age: 1 }
      ]
    });
  });

  it('cursor', function* () {
    let error;
    let usersCursor = yield User.find().select({ _id: 0 }).cursor();
    assert.deepEqual(typeof usersCursor.toArray, 'function');
    assert.deepEqual(typeof usersCursor.next, 'function');
    assert.deepEqual(typeof usersCursor.hasNext, 'function');

    try {
      usersCursor = yield User.find(0).select({ _id: 0 }).cursor();
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error, {
      name: 'MongoError',
      message: 'query selector must be an object',
      driver: true,
      op: 'find',
      args: [ 0, { fields: { _id: 0 } } ],
      model: 'User',
      schema: null
    });
  });

  it('_bindMethod', function* () {
    let error;
    let users;
    try {
      users = yield User.find({}, { sort: { age: -1 } }, console.log);
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error.message, 'Not support callback for method: find, please call .exec() or .cursor()');
    try {
      users = yield User.find({}, { _id: 0 }, { sort: { age: -1 } });
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error.message, 'Only support this usage: find(query, options)');
  });

  it('_bindGetter', function* () {
    let collName = yield User.collectionName;
    assert.deepEqual(collName, 'users');
  });

  it('_bindSetter', function* () {
    let error;
    let users;
    User.hint = { name: 1, age: -1 };
    try {
      users = yield User.find();
    } catch(e) {
      error = e;
    }
    assert.ok(error.message.match(/bad hint/));
  });
});
