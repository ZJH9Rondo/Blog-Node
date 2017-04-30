'use strict';

const _ = require('lodash');
const Schema = require('another-json-schema');
const Types = require('./Types');

class _Schema extends Schema {
  constructor(name, schema) {
    if (!name || !_.isString(name)) {
      throw new TypeError('Schema must have a name');
    }
    super(name, _.defaults(schema, { _id: { type: Types.ObjectId } }));
  }
}

exports.Schema = _Schema;
exports._plugins = function _plugins(schema) {
  return {
    beforeBulkWrite: function beforeBulkWrite() {
      let operations = this._args[0];
      operations.forEach(operation => {
        if (operation.insertOne) {
          formatCreate(operation.insertOne.document, schema);
        }
        if (operation.updateOne) {
          formatQuery(operation.updateOne.filter, schema);
          formatUpdate(operation.updateOne.update, schema);
        }
        if (operation.updateMany) {
          formatQuery(operation.updateMany.filter, schema);
          formatUpdate(operation.updateMany.update, schema);
        }
        if (operation.deleteOne) {
          formatQuery(operation.deleteOne.filter, schema);
        }
        if (operation.deleteMany) {
          formatQuery(operation.deleteMany.filter, schema);
        }
        if (operation.replaceOne) {
          formatQuery(operation.replaceOne.filter, schema);
          formatCreate(operation.replaceOne.replacement, schema);
        }
      });
    },
    beforeCount: function beforeCount() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeDistinct: function beforeDistinct() {
      let query = this._args[1];
      formatQuery(query, schema);
    },
    beforeFind: function beforeFind() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeFindAndModify: function beforeFindAndModify() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[2];
      formatUpdate(doc, schema);
    },
    beforeFindAndRemove: function beforeFindAndRemove() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeFindOne: function beforeFindOne() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeFindOneAndDelete: function beforeFindOneAndDelete() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeFindOneAndReplace: function beforeFindOneAndReplace() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatCreate(doc, schema);
    },
    beforeFindOneAndUpdate: function beforeFindOneAndUpdate() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatUpdate(doc, schema);
    },
    beforeInsert: function beforeInsert() {
      let docs = this._args[0];
      /* istanbul ignore else */
      if (!_.isArray(docs)) {
        docs = [docs];
      }
      docs.forEach(doc => formatCreate(doc, schema));
    },
    beforeInsertOne: function beforeInsertOne() {
      let doc = this._args[0];
      formatCreate(doc, schema);
    },
    beforeInsertMany: function beforeInsertMany() {
      let docs = this._args[0];
      docs.forEach(doc => formatCreate(doc, schema));
    },
    beforeRemove: function beforeRemove() {
      let query = this._args[0];
      formatQuery(query, schema);
    },
    beforeReplaceOne: function beforeReplaceOne() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatCreate(doc, schema);
    },
    beforeSave: function beforeSave() {
      let doc = this._args[0];
      formatCreate(doc, schema);
    },
    beforeUpdate: function beforeUpdate() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatUpdate(doc, schema);
    },
    beforeUpdateOne: function beforeUpdateOne() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatUpdate(doc, schema);
    },
    beforeUpdateMany: function beforeUpdateMany() {
      let query = this._args[0];
      formatQuery(query, schema);
      let doc = this._args[1];
      formatUpdate(doc, schema);
    }
  };
};

const ignoreQueryOperators = [
  '$exists', '$type', '$mod', '$regex', '$text', '$where', '$geoWithin',
  'geoIntersects', '$near', '$nearSphere', '$size', '$bitsAllSet', '$bitsAnySet',
  '$bitsAllClear', '$bitsAnyClear', '$comment', '$meta', '$slice'
];
function formatQuery(query, compiledSchema) {
  if (_.isEmpty(query) || _.isEmpty(compiledSchema)) {
    return query;
  }
  return _formatQuery(query);
  function _formatQuery(query, schemaPath) {
    schemaPath = schemaPath || '';
    if (_.isPlainObject(query) || _.isArray(query)) {
      for (let key in query) {
        if (_.includes(ignoreQueryOperators, key)) {
          continue;
        }
        let subQuery = query[key];
        let subSchemaPath = _.isArray(query)
          ? schemaPath
          : (/^\$/.test(key) ? schemaPath : `${schemaPath ? schemaPath + '.' : ''}${key}`);
        query[key] = _formatQuery(subQuery, subSchemaPath);
      }
    } else {
      let schema = getSchema(compiledSchema, schemaPath);
      /* istanbul ignore else */
      if (schema instanceof Schema) {
        //only leaf & only check type & ignoreNodeType
        /* istanbul ignore else */
        if (schema._leaf) {
          let opts = _.reduce(schema._children, (result, value, key) => {
            result[key] = false;
            return result;
          }, {
            additionalProperties: true,
            ignoreNodeType: true
          });
          //try format, if false then pass
          query = schema.validate(query, opts).result;
        }
      }
    }
    return query;
  }
}

function formatCreate(doc, schema, opts) {
  if (schema instanceof Schema) {
    let result = schema.validate(doc, opts);
    if (!result.valid) {
      throw result.error;
    }
    return result.result;
  }
  return doc;
}

const ignoreUpdateOperators = [
  '$mul', '$rename', '$unset', '$min', '$max', '$currentDate',
  '$pop', '$slice', '$sort', '$position', '$bit', '$isolated'
];
const useSchemaValidator = ['$set', '$setOnInsert'];

function formatUpdate(doc, compiledSchema, opts) {
  if (_.isEmpty(doc) || _.isEmpty(compiledSchema)) {
    return doc;
  }
  opts = opts || {};
  return _formatUpdate(doc, '', opts);
  function _formatUpdate(doc, schemaPath, opts) {
    if (_.isPlainObject(doc) || _.isArray(doc)) {
      for (let key in doc) {
        if (_.includes(ignoreUpdateOperators, key)) {
          continue;
        }
        let subDoc = doc[key];
        let subSchemaPath = _.isArray(doc)
          ? schemaPath
          : (/^\$/.test(key) ? schemaPath : `${schemaPath ? schemaPath + '.' : ''}${key}`);
        //$set or $setOnInsert
        if (_.includes(useSchemaValidator, key)) {
          let schema = getSchema(compiledSchema, subSchemaPath);
          doc[key] = formatCreate(subDoc, schema);
        } else {
          //others ignoreNodeType
          opts.ignoreNodeType = true;
          doc[key] = _formatUpdate(subDoc, subSchemaPath, opts);
        }
      }
    } else {
      let schema = getSchema(compiledSchema, schemaPath);
      doc = formatCreate(doc, schema, opts);
    }
    return doc;
  }
}

function getSchema(compiledSchema, schemaPath) {
  return schemaPath ? _.get(compiledSchema, '_children.' + schemaPath.replace(/\.[\$\d]/, '').split('.').join('._children.')) : compiledSchema;
}
