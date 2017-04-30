### another-json-schema

Another JSON Schema, simple & flexible & intuitive.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

### Install

```
npm i another-json-schema --save
```

### Usage

simple:

```
var AJS = require('another-json-schema');

var userSchema = AJS('userSchema', {
  name: { type: 'string' },
  age: { type: 'number', gte: 18 }
});

var user = {
  name: 'nswbmw',
  age: 17
};

console.log(userSchema.validate(user));
/*
{ valid: false,
  error:
   { [Error: ($.age: 17) ✖ (gte: 18)]
     validator: 'gte',
     actual: 17,
     expected: { type: 'number', gte: 18 },
     path: '$.age',
     schema: 'userSchema' },
  result: { name: 'nswbmw', age: 17 } }
 */
```

complex:

```
var AJS = require('another-json-schema');

var userSchema = AJS('userSchema', {
  _id: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
  name: { type: 'string' },
  age: { type: 'number', gte: 18 },
  gender: { type: 'string', enum: ['male', 'female'] }
});

var commentSchema = AJS('commentSchema', {
  _id: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
  user: userSchema,
  content: { type: 'string' }
});

var postSchema = AJS('postSchema', {
  _id: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
  author: userSchema,
  content: { type: 'string' },
  comments: [commentSchema]
});

var post = {
  _id: 'post11111111111111111111',
  author: {
    _id: 'user11111111111111111111',
    name: 'nswbmw',
    age: 100,
    gender: 'male',
    pet: 'cat'
  },
  content: 'lalala',
  comments: [{
    _id: 'comment11111111111111111',
    user: {
      _id: 'wrong_id',
      name: 'user1',
      age: 100,
      gender: 'male'
    },
    content: 'sofa'
  }]
};

console.log(postSchema.validate(post));
/*
{ valid: false,
  error:
   { [Error: ($.comments[].user._id: "wrong_id") ✖ (pattern: /^[0-9a-z]{24}$/)]
     validator: 'pattern',
     actual: 'wrong_id',
     expected: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
     path: '$.comments[].user._id',
     schema: 'userSchema' },
  result:
   { _id: 'post11111111111111111111',
     author:
      { _id: 'user11111111111111111111',
        name: 'nswbmw',
        age: 100,
        gender: 'male' },
     content: 'lalala',
     comments: [ [Object] ] } }
 */
```

custom validate function(like: ObjectId):

```
var validator = require('validator');
var toObjectId = require('mongodb').ObjectId;
var AJS = require('another-json-schema');

var postSchema = AJS('postSchema', {
  author: {
    type: function ObjectId(value) {
      if (!value || !validator.isMongoId(value.toString())) {
        throw new Error('author is not a valid ObjectId');
      }
      return toObjectId(value);
    }
  },
  content: { type: 'string' }
});

var post = {
  author: '111111111111111111111111',
  content: 'haha'
};

console.log(postSchema.validate(post));
/*
{ valid: true,
  error: null,
  result: { author: 111111111111111111111111, content: 'haha' } }
 */

//validate specific field
console.log(postSchema._children.author.validate('lalala'));
/*
{ valid: false,
  error:
   { [Error: ($.author: "lalala") ✖ (type: ObjectId)]
     validator: 'type',
     actual: 'lalala',
     expected: { type: [Function: ObjectId] },
     path: '$.author',
     schema: 'postSchema',
     originError: [Error: author is not a valid ObjectId] },
  result: 'lalala' }
 */
```

**Note:** `type` validator is special, it can overwrite original value by value returned from function. others validator can only validate its value.

### API

#### AJS([name], schema)

Constructor.

#### AJS.register(name, fn)

Register a validator. eg:

```
AJS.register('gt', function (actual, expected, key, parentNode) {
  return actual > expected;
});
```

#### schema.compile([name], schema)

Compile a schema. The following two ways are the same:

```
var userSchema = AJS('userSchema', {
  _id: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
  name: { type: 'string' },
  age: { type: 'number', gte: 18 },
  gender: { type: 'string', enum: ['male', 'female'] }
});
```

```
var newSchema = new AJS();
var userSchema = newSchema.compile('userSchema', {
  _id: { type: 'string', pattern: /^[0-9a-z]{24}$/ },
  name: { type: 'string' },
  age: { type: 'number', gte: 18 },
  gender: { type: 'string', enum: ['male', 'female'] }
});
```

#### compiledSchema.validate(data, [opts])

Use the compiled template to validate a json. returns a object:

- valid: {Boolean} wether a valid json
- error: {Error|null}
  - message: error message, eg: `($.comments[].user._id: "wrong_id") ✖ (pattern: /^[0-9a-z]{24}$/)`
  - validator: validator name, eg: `pattern`,
  - actual: actual value, eg: `wrong_id`,
  - expected: expected schema, eg: `{ type: 'string', pattern: /^[0-9a-z]{24}$/ }`,
  - path: path in object, eg: `$.comments[].user._id`,
  - schema: schema name, eg: `userSchema`
  - originError: original error thrown from validator
- result: {Any}

opts:

- additionalProperties: {Boolean} if true, retain the original field. default `false`
- ignoreNodeType: {Boolean} if true, ignore check node type, like: `[]`. default: `false`
- gt, gte, lt, lte ...: {Boolean} if false, will not execute this validator.

### Buit-in validator

- type
- gt
- gte
- lt
- lte
- range
- enum
- pattern

### More examples

see [test](./test).

### Test

```
npm test (coverage 100%)
```

### License

MIT

[npm-image]: https://img.shields.io/npm/v/another-json-schema.svg?style=flat-square
[npm-url]: https://npmjs.org/package/another-json-schema
[travis-image]: https://img.shields.io/travis/nswbmw/another-json-schema.svg?style=flat-square
[travis-url]: https://travis-ci.org/nswbmw/another-json-schema
[david-image]: http://img.shields.io/david/nswbmw/another-json-schema.svg?style=flat-square
[david-url]: https://david-dm.org/nswbmw/another-json-schema
[license-image]: http://img.shields.io/npm/l/another-json-schema.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/another-json-schema.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/another-json-schema
