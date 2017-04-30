'use strict';

var toString = Object.prototype.toString;

//return value or throw error
exports.type = function (actual, expected) {
  if (expected === 'any') return actual;
  if ('function' === typeof expected) {
    return expected.call(this, actual);
  }
  if (expected === toString.call(actual).match(/^\[object\s(.*)\]$/)[1].toLowerCase()) {
    return actual;
  } else {
    throw null;
  }
};

//return true|false
/*
 * Number
 */
exports.gt = function (actual, expected) {
  return actual > expected;
};

exports.gte = function (actual, expected) {
  return actual >= expected;
};

exports.lt = function (actual, expected) {
  return actual < expected;
};

exports.lte = function (actual, expected) {
  return actual <= expected;
};

exports.range = function (actual, expected) {
  return (actual >= expected[0]) && (actual <= expected[1]);
};

/*
 * Array
 */
exports.enum = function (actual, expected) {
  return expected.indexOf(actual) !== -1;
};

/*
 * RegExp
 */
exports.pattern = function (actual, expected) {
  return expected.test(actual);
};
