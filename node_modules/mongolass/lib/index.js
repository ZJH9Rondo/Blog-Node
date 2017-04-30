'use strict';

const _ = require('lodash');
const debug = require('debug')('mongolass');
const mongodb = require('mongodb');
const Schema = require('./schema').Schema;
const Model = require('./model');
const Query = require('./query');
const plugins = require('./plugins');
const Types = require('./Types');

const DEFAULT_MONGODB_URL = 'mongodb://localhost:27017/test';

module.exports = class Mongolass {
  constructor(url, opts) {
    if (url) {
      this.connect(url, opts);
    }
    this._name = this.constructor.name;
    this._plugins = {};
    this._schemas = {};
    this._models = {};
    this._url = url || DEFAULT_MONGODB_URL;
    this._opts = opts || {};

    Query.bindQuery(this, mongodb.Db);

    for (let name in plugins) {
      this.plugin(name, plugins[name]);
    }
  }

  /**
   * connect mongodb
   */
  connect(url, opts) {
    if (this._db) {
      if (url) {
        return Promise.reject(new Error(`Already connected to ${this._url}, please create another connection.`));
      }
      return Promise.resolve(this._db);
    }
    this._url = url || this._url;
    this._opts = opts || this._opts;

    this._conn = this._conn || mongodb.MongoClient
      .connect(this._url, this._opts)
      .then(db => {
        this._db = db;
        debug('Connected ' + this._url);
        return this._db;
      })
      .catch(e => {
        console.error(e);
        throw e;
      });
    return this._conn;
  }

  /**
   * disconnect mongodb
   */
  disconnect() {
    if (this._db) {
      this._db.close();
      this._db = null;
      this._conn = null;
      debug('Disconnect ' + this._url);
    }
  }

  /**
   * get/set collection schema
   */
  schema(name, schemaJSON) {
    if (!name || !_.isString(name)) {
      throw new TypeError('Missing schema name');
    }
    if (schemaJSON) {
      if ('object' !== typeof schemaJSON) throw new TypeError('Wrong schemaJSON for schema: ' + name);
      this._schemas[name] = new Schema(name, schemaJSON);
    }
    if (!this._schemas[name]) {
      throw new TypeError('No schema: ' + name);
    }

    return this._schemas[name];
  }

  /**
   * get/set collection model
   */
  model(name, schema, opts) {
    if (!name || !_.isString(name)) {
      throw new TypeError('Missing model name');
    }
    if (schema) {
      if (!(schema instanceof Schema)) {
        schema = this.schema(name + 'Schema', schema);
      }
      this._models[name] = new Model(name, schema, this, opts);
    } else {
      this._models[name] = this._models[name] || new Model(name, null, this, opts);
    }

    return this._models[name];
  }

  /**
   * add global plugin
   */
  plugin(name, hooks) {
    if (!name || !hooks || !_.isString(name) || !_.isPlainObject(hooks)) {
      throw new TypeError('Wrong plugin name or hooks');
    }
    this._plugins[name] = {
      name: name,
      hooks: hooks
    };
    for (let model in this._models) {
      _.defaults(this._models[model]._plugins, this._plugins);
    }
    debug('Add global pulgin: %j', name);
  }
};

for (let key in mongodb) {
  module.exports[key] = mongodb[key];
}
module.exports.Schema = Schema;
module.exports.Model = Model;
module.exports.Types = Types;
