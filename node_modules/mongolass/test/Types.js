'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

const assert = require('assert');
const Mongolass = require('..');
const Schema = Mongolass.Schema;
const Types = Mongolass.Types;
const mongolass = new Mongolass(MONGODB);

const UserSchema = new Schema('User', {
  uid: { type: Types.ObjectId },
});
const User = mongolass.model('User', UserSchema);

describe('Types.js', function () {
  before(function* () {
    yield User.insertOne({ uid: '5721bb5abec50ab84b8eb109' });
  });

  after(function* () {
    yield User.remove();
    mongolass.disconnect();
  });

  it('ObjectId wrong', function* () {
    let error;
    try {
      yield User.insertOne({ uid: 'haha' });
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error.message, '($.uid: "haha") ✖ (type: ObjectId)');
  });

  it('ObjectId', function* () {
    let user = yield User.findOne({ uid: '5721bb5abec50ab84b8eb109' });
    assert.ok('object' === typeof user._id);
    assert.deepEqual(user.uid.toString(), '5721bb5abec50ab84b8eb109');
  });
});
