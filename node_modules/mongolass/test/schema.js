'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

const assert = require('assert');
const Mongolass = require('..');
const Schema = Mongolass.Schema;
const ObjectId = Mongolass.ObjectId;
const mongolass = new Mongolass(MONGODB);

const UserSchema = new Schema('User', {
  name: { type: 'string' },
  age: { type: 'number', range: [0, 100] },
  refe: { type: Mongolass.Types.ObjectId },
  posts: [{
    title: { type: 'string' },
    comments: [{ type: Mongolass.Types.ObjectId }]
  }]
});
const User = mongolass.model('User', UserSchema);

describe('schema.js', function () {
  before(function* () {
    yield User.create({
      name: 'aaa',
      age: 2,
      refe: ObjectId('222222222222222222222222'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('333333333333333333333333')]
      }]
    });
    yield User.create({
      name: 'bbb',
      age: 1,
      refe: ObjectId('111111111111111111111111'),
      posts: [{
        title: 'bbb',
        comments: [ObjectId('444444444444444444444444')]
      }]
    });
  });

  after(function* () {
    yield User.remove();
    mongolass.disconnect();
  });

  it('No schema name', function* () {
    let error;
    try {
      new Schema({
        name: { type: 'string' },
        age: { type: 'number', range: [0, 100] },
        refe: { type: Mongolass.Types.ObjectId },
        posts: [{
          title: { type: 'string' },
          comments: [{ type: Mongolass.Types.ObjectId }]
        }]
      });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error.message, 'Schema must have a name');
  });

  it('beforeBulkWrite', function* () {
    let error;
    try {
      yield User.bulkWrite([{ insertOne: { document: { name: 1, age: 1 } } }]);
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeBulkWrite',
      args: []
    });

    try {
      yield User.bulkWrite([{ updateOne: { filter: { name: 'aaa' }, update: { age: 101 }, upsert: true } }]);
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: 101,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeBulkWrite',
      args: []
    });

    try {
      yield User.bulkWrite([{ updateMany: { filter: { name: 'aaa' }, update: { name: 1 }, upsert: true } }]);
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeBulkWrite',
      args: []
    });

    yield User.bulkWrite([{ deleteOne: { filter: { refe: '222222222222222222222222' } } }]);
    yield User.bulkWrite([{ deleteMany: { filter: { refe: '111111111111111111111111' } } }]);
    yield User.create({
      name: 'aaa',
      age: 2,
      refe: ObjectId('222222222222222222222222'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('333333333333333333333333')]
      }]
    });
    yield User.create({
      name: 'bbb',
      age: 1,
      refe: ObjectId('111111111111111111111111'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('444444444444444444444444')]
      }]
    });

    try {
      yield User.bulkWrite([{ replaceOne: { filter: { name: 'aaa' }, replacement: { name: 1, age: 1 }, upsert: true } }]);
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeBulkWrite',
      args: []
    });
  });

  it('beforeCount', function* () {
    let count = yield User.count({ name: 'aaa'});
    assert.deepEqual(count, 1);

    count = yield User.count({ refe: '111111111111111111111111' });
    assert.deepEqual(count, 1);

    count = yield User.count({ refe: ObjectId('111111111111111111111111')});
    assert.deepEqual(count, 1);
  });

  it('beforeDistinct', function* () {
    let count = yield User.distinct('name');
    assert.deepEqual(count, ['aaa', 'bbb']);

    count = yield User.distinct('name', { refe: '111111111111111111111111' });
    assert.deepEqual(count, ['bbb']);

    count = yield User.distinct('name', { refe: ObjectId('111111111111111111111111') });
    assert.deepEqual(count, ['bbb']);
  });

  describe('beforeFind', function () {
    it('$eq', function* () {
      let docs = yield User
        .find({ refe: { $eq: '111111111111111111111111' } })
        .select({ _id: 0, name: 1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
    });

    it('$gt', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $gt: '000000000000000000000000' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $gt: '333333333333333333333333' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $gt: '444444444444444444444444' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
    });

    it('$gte', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $gte: '333333333333333333333333' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $gte: '444444444444444444444444' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $gte: '555555555555555555555555' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
    });

    it('$lt', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $lt: '333333333333333333333333' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({ 'posts.comments': { $lt: '444444444444444444444444' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $lt: '555555555555555555555555' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$lte', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $lte: '000000000000000000000000' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({ 'posts.comments': { $lte: '333333333333333333333333' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $lte: '444444444444444444444444' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$ne', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $ne: '333333333333333333333333' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $ne: '' } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$in', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $in: ['333333333333333333333333', ObjectId('444444444444444444444444')] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $in: ['333333333333333333333333'] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $in: ['aaa', 'bbb'] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
    });

    it('$nin', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $nin: ['333333333333333333333333', ObjectId('444444444444444444444444')] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({ 'posts.comments': { $nin: ['333333333333333333333333'] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $nin: ['aaa', 'bbb'] } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$or', function* () {
      let docs = yield User
        .find({
          $or: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['444444444444444444444444'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({
          $or: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['333333333333333333333333'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
    });

    it('$and', function* () {
      let docs = yield User
        .find({
          $and: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['444444444444444444444444'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({
          $and: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['444444444444444444444444', '333333333333333333333333'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
    });

    it('$not', function* () {
      let docs = yield User
        .find({ 'posts.comments': { $not: { $gte: '444444444444444444444444' } } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'aaa' }
      ]);
      docs = yield User
        .find({ 'posts.comments': { $not: { $lt: '333333333333333333333333' } } })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$nor', function* () {
      let docs = yield User
        .find({
          $nor: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['444444444444444444444444'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({
          $nor: [
            { name: 'aaa' },
            { 'posts.comments': { $in: ['333333333333333333333333'] } }
          ]
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
    });

    it('$all', function* () {
      let docs = yield User
        .find({
          'posts.comments': { $all: ['444444444444444444444444'] }
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({
          'posts.comments': { $all: ['444444444444444444444444', '333333333333333333333333'] }
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
      docs = yield User
        .find({
          'posts.comments': { $all: ['111111111111111111111111'] }
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, []);
    });

    it('$elemMatch', function* () {
      let docs = yield User
        .find({
          posts: {
            $elemMatch: {
              comments: { $in: ['444444444444444444444444'] }
            }
          }
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' }
      ]);
      docs = yield User
        .find({
          posts: {
            $elemMatch: {
              comments: { $in: ['444444444444444444444444', ObjectId('333333333333333333333333')] },
              title: { $in: ['aaa', 'bbb', 'ccc'] }
            }
          }
        })
        .select({ _id: 0, name: 1 })
        .sort({ name: -1 });
      assert.deepEqual(docs, [
        { name: 'bbb' },
        { name: 'aaa' }
      ]);
    });

    it('$xxx', function* () {
      let count = yield User.count({ name: { $exists: true } });
      assert.deepEqual(count, 2);

      count = yield User.count({ name: { $exists: true }, refe: '111111111111111111111111' });
      assert.deepEqual(count, 1);

      count = yield User.count({ haha: { $exists: true } });
      assert.deepEqual(count, 0);
    });
  });

  it('beforeFindAndModify', function* () {
    let error;
    try {
      yield User.findAndModify({ name: 'aaa'}, { age: 1 }, { age: 101 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: 101,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeFindAndModify',
      args: []
    });
  });

  it('beforeFindAndRemove', function* () {
    yield User.findAndRemove({ name: 'aaa'});
    yield User.create({
      name: 'aaa',
      age: 2,
      refe: ObjectId('222222222222222222222222'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('333333333333333333333333')]
      }]
    });

    let count = yield User.count();
    assert.deepEqual(count, 2);
  });

  it('beforeFindOne', function* () {
    let doc = yield User.findOne({ refe: '222222222222222222222222' }).select({ _id: 0, name: 1 });
    assert.deepEqual(doc, { name: 'aaa' });

    doc = yield User.findOne({ refe: ObjectId('222222222222222222222222') }).select({ _id: 0, name: 1 });
    assert.deepEqual(doc, { name: 'aaa' });
  });

  it('beforeFindOneAndDelete', function* () {
    yield User.findOneAndDelete({ refe: '222222222222222222222222' });
    yield User.create({
      name: 'aaa',
      age: 2,
      refe: ObjectId('222222222222222222222222'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('333333333333333333333333')]
      }]
    });

    let count = yield User.count();
    assert.deepEqual(count, 2);
  });

  it('beforeFindOneAndReplace', function* () {
    let error;
    try {
      yield User.findOneAndReplace({ name: 'aaa'}, { name: 1, age: 1 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeFindOneAndReplace',
      args: []
    });
  });

  it('beforeFindOneAndUpdate', function* () {
    let error;
    try {
      yield User.findOneAndUpdate({ name: 'aaa'}, { age: 101 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: 101,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeFindOneAndUpdate',
      args: []
    });
  });

  it('beforeInsert', function* () {
    let error;
    try {
      yield User.insert({ name: 1, age: 101 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeInsert',
      args: []
    });
  });

  it('beforeInsertOne', function* () {
    let error;
    try {
      yield User.insertOne({ name: 1, age: 101 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeInsertOne',
      args: []
    });
  });

  it('beforeInsertMany', function* () {
    let error;
    try {
      yield User.insertMany([{ name: 'ccc', age: 3 }, { name: 'ddd', age: -1 }]);
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: -1,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeInsertMany',
      args: []
    });
  });

  it('beforeRemove', function* () {
    yield User.remove({ refe: '222222222222222222222222' });
    yield User.create({
      name: 'aaa',
      age: 2,
      refe: ObjectId('222222222222222222222222'),
      posts: [{
        title: 'aaa',
        comments: [ObjectId('333333333333333333333333')]
      }]
    });

    let count = yield User.count();
    assert.deepEqual(count, 2);
  });

  it('beforeReplaceOne', function* () {
    let error;
    try {
      yield User.replaceOne({ name: 'aaa' }, { name: 'ddd', age: -1 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: -1,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeReplaceOne',
      args: []
    });
  });

  it('beforeSave', function* () {
    let error;
    try {
      yield User.save({ name: 1, age: 101 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'type',
      actual: 1,
      expected: { type: 'string' },
      path: '$.name',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeSave',
      args: []
    });
  });

  describe('beforeUpdate', function () {
    it('$inc', function* () {
      let error;
      yield User.update({ name: 'bbb' }, { $inc: { age: 1 } });
      let b = yield User.findOne({ name: 'bbb' });
      assert.deepEqual(b.age, 2);

      try {
        yield User.update({ name: 'aaa' }, { $inc: { refe: 1 } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'type',
        actual: 1,
        expected: { type: Mongolass.Types.ObjectId },
        path: '$.refe',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });
    });

    it('$set', function* () {
      let error;
      yield User.update({ name: 'bbb' }, { $set: { age: 3 } });
      let doc = yield User.findOne({ name: 'bbb' });
      assert.deepEqual(doc.age, 3);

      try {
        yield User.update({ name: 'aaa' }, { $set: { refe: 1 } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'type',
        actual: 1,
        expected: { type: Mongolass.Types.ObjectId },
        path: '$.refe',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });
    });

    it('$setOnInsert', function* () {
      let error;
      yield User.update({ name: 'ccc' }, { $setOnInsert: { age: 3 } }, { upsert: true });
      let doc = yield User.findOne({ name: 'ccc' }).select({ _id: 0 });
      assert.deepEqual(doc, {
        name: 'ccc',
        age: 3
      });
      yield User.remove({ name: 'ccc' });

      try {
        yield User.update({ name: 'aaa' }, { $setOnInsert: { refe: 1 } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'type',
        actual: 1,
        expected: { type: Mongolass.Types.ObjectId },
        path: '$.refe',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });
    });

    it('$addToSet', function* () {
      let error;
      try {
        yield User.update({ name: 'aaa' }, { $addToSet: { 'posts.0.comments': 3 } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'type',
        actual: 3,
        expected: { type: Mongolass.Types.ObjectId },
        path: '$.posts[].comments[]',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });

      yield User.update({ name: 'aaa' }, { $addToSet: {
        posts: {
          title: 'aaa',
          comments: ['555555555555555555555555']
        }
      } });
      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].title, 'aaa');
      assert.deepEqual(doc.posts[0].comments[0].toString(), '333333333333333333333333');
      assert.deepEqual(doc.posts[1].title, 'aaa');
      assert.deepEqual(doc.posts[1].comments[0].toString(), '555555555555555555555555');

      try {
        yield User.update({ name: 'aaa' }, { $addToSet: {
          posts: {
            title: 'aaa',
            comments: 0
          }
        } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'type',
        actual: 0,
        expected: { type: Mongolass.Types.ObjectId },
        path: '$.posts[].comments[]',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });
    });

    it('$pull', function* () {
      yield User.update({ name: 'aaa' }, { $addToSet: {
        'posts.0.comments': '555555555555555555555555'
      } });

      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 2);

      yield User.update({ 'posts.comments': '333333333333333333333333' }, { $pull: { 'posts.$.comments': { $in: ['555555555555555555555555'] } } });
      doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 1);
    });

    it('$pullAll', function* () {
      yield User.update({ name: 'aaa' }, { $addToSet: {
        'posts.0.comments': { $each: ['555555555555555555555555', '666666666666666666666666'] }
      } });
      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 3);

      yield User.update({ 'posts.comments': '333333333333333333333333' }, { $pullAll: { 'posts.$.comments': ['555555555555555555555555', '666666666666666666666666'] } });
      doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 1);
    });

    it('$push', function* () {
      yield User.update({ name: 'aaa' }, { $push: {
        'posts.0.comments': { $each: ['333333333333333333333333', '555555555555555555555555', '666666666666666666666666'] }
      } });
      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 4);

      yield User.update({ 'posts.comments': '333333333333333333333333' }, { $pullAll: { 'posts.$.comments': ['333333333333333333333333', '555555555555555555555555', '666666666666666666666666'] } });
      doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 0);

      yield User.update({ name: 'aaa' }, { $push: {
        'posts.0.comments': { $each: ['333333333333333333333333'] }
      } });
    });

    it('$pushAll', function* () {
      yield User.update({ name: 'aaa' }, { $pushAll: {
        'posts.0.comments': ['555555555555555555555555', '666666666666666666666666']
      } });
      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 3);

      yield User.update({ 'posts.comments': '333333333333333333333333' }, { $pullAll: { 'posts.$.comments': ['555555555555555555555555', '666666666666666666666666'] } });
      doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 1);
    });

    it('$xxx', function* () {
      let doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 1);

      yield User.update({ name: 'aaa' }, { $pop: {
        'posts.0.comments': 1
      } });
      doc = yield User.findOne({ name: 'aaa' });
      assert.deepEqual(doc.posts[0].comments.length, 0);

      yield User.update({ name: 'aaa' }, { $pushAll: {
        'posts.0.comments': ['333333333333333333333333']
      } });
    });

    it('wrong type', function* () {
      let error;
      try {
        yield User.update({ name: 'aaa' }, null);
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        name: 'MongoError',
        message: 'document must be a valid JavaScript object',
        driver: true,
        op: 'update',
        args: [ { name: 'aaa' }, null ],
        model: 'User',
        schema: 'User'
      });

      try {
        yield User.update({ name: 'aaa' }, { age: -1 });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });

      try {
        yield User.update({ name: 'aaa' }, { $set: { age: -1 } });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'MongolassSchema',
        type: 'beforeUpdate',
        args: []
      });
    });
  });

  it('beforeUpdateOne', function* () {
    let error;
    try {
      yield User.updateOne({ name: 'aaa' }, { age: -1 }, { multi: true });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: -1,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeUpdateOne',
      args: []
    });
  });

  it('beforeUpdateMany', function* () {
    let error;
    try {
      yield User.updateMany({ name: 'aaa' }, { age: -1 });
    } catch (e) {
      error = e;
    }
    assert.deepEqual(error, {
      validator: 'range',
      actual: -1,
      expected: { type: 'number', range: [ 0, 100 ] },
      path: '$.age',
      schema: 'User',
      model: 'User',
      plugin: 'MongolassSchema',
      type: 'beforeUpdateMany',
      args: []
    });
  });
});
