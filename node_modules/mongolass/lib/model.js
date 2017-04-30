'use strict';

const _ = require('lodash');
const debug = require('debug')('mongolass-model');
const mongodb = require('mongodb');
const inflected = require('inflected');
const Query = require('./query');

class Model {
  constructor(name, schema, db, opts) {
    opts = opts || {};
    this._db = db;
    this._schema = schema;
    this._name = name;
    this._collName = opts.collName || inflected.pluralize(name).toLowerCase();
    this._opts = opts;
    this._plugins = {};

    this._connect();
    Query.bindQuery(this, mongodb.Collection);

    //alias
    this.create = this.insert;
    this.index = this.ensureIndex;

    _.defaults(this._plugins, this._db._plugins);
  }

  /**
   * get a collection
   */
  _connect(collName, opts) {
    if (this._coll) {
      return Promise.resolve(this._coll);
    }
    this._collName = collName || this._collName;
    this._opts = opts || this._opts;
    this._conn = this._conn || this._db
      .connect()
      .then(db => {
        this._coll = db.collection(this._collName, this._opts);
        debug('Get collection: ' + this._collName);
        return this._coll;
      })
      .catch(e => {
        console.error(e);
        throw e;
      });
    return this._conn;
  }

  /**
   * get/set another model
   */
  model(name, schema, opts) {
    return this._db.model(name, schema, opts);
  }

  /**
   * add model plugin
   */
  plugin(name, hooks) {
    if (!name || !hooks || !_.isString(name) || !_.isPlainObject(hooks)) {
      throw new TypeError('Wrong plugin name or hooks');
    }
    this._plugins[name] = {
      name: name,
      hooks: hooks
    };
    debug('Add %s pulgin: %j', this._name, name);
  }
}

module.exports = Model;
