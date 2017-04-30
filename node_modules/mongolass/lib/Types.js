'use strict';

const validator = require('validator');
const toObjectId = require('mongodb').ObjectId;

exports.ObjectId = function ObjectId(actual) {
  if (!validator.isMongoId(actual.toString())) {
    throw null;
  }
  return toObjectId(actual);
};
