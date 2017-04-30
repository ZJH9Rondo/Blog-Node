'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

const _ = require('lodash');
const assert = require('assert');
const Mongolass = require('..');
const mongolass = new Mongolass(MONGODB);

const User = mongolass.model('User');

describe('plugins.js', function () {
  before(function* () {
    yield mongolass.model('User').insertOne({ name: 'aaa', age: 2 });
    yield mongolass.model('User').insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('limit', function* () {
    let users = yield User.find({ age: { $gte: 0 } }).select({ _id: 0 }).limit(1);
    assert.deepEqual(users, [ { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().select({ _id: 0 }).limit(1);
    assert.deepEqual(users, { name: 'aaa', age: 2 });
  });

  it('sort', function* () {
    let users = yield User.find().select({ _id: 0 }).sort({ age: -1 });
    assert.deepEqual(users, [ { name: 'aaa', age: 2 }, { name: 'bbb', age: 1 } ]);
    users = yield User.findOne().select({ _id: 0 }).sort({ age: -1 });
    assert.deepEqual(users, { name: 'aaa', age: 2 });
  });

  it('fields', function* () {
    let users = yield User.find().fields({ _id: 0 }).sort({ age: 1 });
    assert.deepEqual(users, [ { name: 'bbb', age: 1 }, { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().fields({ _id: 0 }).sort({ age: 1 });
    assert.deepEqual(users, { name: 'bbb', age: 1 });
  });

  it('skip', function* () {
    let users = yield User.find().select({ _id: 0 }).skip(1);
    assert.deepEqual(users, [ { name: 'bbb', age: 1 } ]);
    users = yield User.findOne().select({ _id: 0 }).skip(1);
    assert.deepEqual(users, { name: 'bbb', age: 1 });
  });

  it('hint', function* () {
    yield User.ensureIndex({ name: -1 });
    let users = yield User.find().select({ _id: 0 }).hint({ name: -1 });
    assert.deepEqual(users, [ { name: 'bbb', age: 1 }, { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().select({ _id: 0 }).hint({ name: -1 });
    assert.deepEqual(users, { name: 'bbb', age: 1 });
    yield User.dropIndex('name_-1');
  });
});
