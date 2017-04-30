'use strict';

const populate = require('mongolass-plugin-populate');

// built-in plugins
const options = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout', 'tailable', 'tailableRetryInterval', 'numberOfRetries', 'awaitdata', 'oplogReplay', 'exhaust', 'batchSize', 'returnKey', 'maxScan', 'min', 'max', 'showDiskLoc', 'comment', 'raw', 'readPreference', 'partial', 'maxTimeMS'];

options.forEach(function (key) {
  exports[key] = {
    beforeFind: function beforeFind(value) {
      bindOption.call(this, key, value);
    },
    beforeFindOne: function beforeFindOne(value) {
      bindOption.call(this, key, value);
    }
  };
});

exports.select = exports.fields;

// .populate({ path: 'xxx', match: { ... }, select: { xx: 1 }, model: 'User', options: {} })
exports.populate = populate;

function bindOption(key, value) {
  if (this._args.length === 0) {
    this._args.push({}, {});
  } else if (this._args.length === 1) {
    this._args.push({});
  }
  this._args[1][key] = value;
}
