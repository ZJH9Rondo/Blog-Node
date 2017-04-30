'use strict';

var AJS = require('..');
var assert = require('assert');

describe('compile', function () {
  it('error', function () {
    try {
      AJS(111, 222);
    } catch(e) {
      assert.equal(e.message, 'Schema must be object or array');
    }
  });

  it('leaf', function () {
    var schema1 = AJS({ type: 'string' });
    assert.deepEqual(schema1, {
      _leaf: true,
      _children: { type: 'string' },
      _parent: null,
      _path: '$',
      _schema: { type: 'string' }
    });

    var schema2 = AJS([{ type: 'string' }]);
    assert.deepEqual(schema2, {
      _array: true,
      _leaf: true,
      _children: { type: 'string' },
      _parent: null,
      _path: '$[]',
      _schema: [{ type: 'string' }]
    });

    var schema3 = AJS('stringSchema', [{ type: 'string' }]);
    assert.deepEqual(schema3, {
      _array: true,
      _leaf: true,
      _name: 'stringSchema',
      _children: { type: 'string' },
      _parent: null,
      _path: '$[]',
      _schema: [{ type: 'string' }]
    });
  });

  it('object', function () {
    var schema1 = AJS({
      author: {
        type: 'string',
        age: { type: 'number' }
      }
    });
    var schema2 = AJS({
      author: AJS({
        type: 'string',
        age: { type: 'number' }
      })
    });

    try {
      assert.deepEqual(schema1, schema2);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }

    var schema1 = AJS({
      author: {
        type: { type: 'string' },
        age: { type: 'number' }
      }
    });
    var schema2 = AJS({
      author: AJS({
        type: AJS({ type: 'string' }),
        age: { type: 'number' }
      })
    });

    try {
      assert.deepEqual(schema1, schema2);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }

    var schema1 = AJS({
      author: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    });
    var schema2 = AJS({
      author: AJS({
        name: { type: 'string' },
        age: { type: 'number' }
      })
    });
    var schema3 = AJS({
      author: AJS({
        name: AJS({ type: 'string' }),
        age: { type: 'number' }
      })
    });
    try {
      assert.deepEqual(schema1, schema2);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }
    try {
      assert.deepEqual(schema1, schema3);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }
  });

  it('array', function () {
    var schema1 = AJS([{
      authors: [{
        names: [{ type: 'string' }],
        age: { type: 'number' }
      }]
    }]);
    var schema2 = AJS([{
      authors: AJS([{
        names: [{ type: 'string' }],
        age: { type: 'number' }
      }])
    }]);
    var schema3 = AJS([{
      authors: AJS([{
        names: AJS([{ type: 'string' }]),
        age: { type: 'number' }
      }])
    }]);
    try {
      assert.deepEqual(schema1, schema2);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }
    try {
      assert.deepEqual(schema1, schema3);
    } catch(e) {
      assert.equal(e.message, 'Maximum call stack size exceeded');
    }
  });
});
