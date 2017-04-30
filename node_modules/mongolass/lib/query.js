'use strict';

const os = require('os');
const _ = require('lodash');
const Promise = require('bluebird');
const co = require('co');
const debug = require('debug')('mongolass-query');
const plugins = require('./schema')._plugins;

exports.bindQuery = function bindQuery(ctx, NativeClass) {
  for (let propName in NativeClass.prototype) {
    if (propName[0] !== '_') _bindProperty(propName);
  }

  function _bindProperty(propName) {
    let fn;
    let desc = Object.getOwnPropertyDescriptor(NativeClass.prototype, propName);
    if (!desc) {
      try {
        fn = NativeClass.prototype[propName];
      } catch(e) {}
    } else {
      fn = desc.value;
    }
    if (_.isFunction(fn)) {
      _bindMethod(propName);
    } else if (desc) {
      /* istanbul ignore else */
      if (desc.get) {
        _bindGetter(propName);
      }
      /* istanbul ignore else */
      if (desc.set) {
        _bindSetter(propName);
      }
    }
  }

  class Query {
    constructor(op, args) {
      Error.captureStackTrace(this, this.constructor);// preserve stack

      this._op = op;
      this._args = args;
      // register built-in schema plugin
      this._plugins = [{
        name: 'MongolassSchema',
        hooks: plugins(ctx._schema),
        args: []
      }];
      this._model = ctx;

      _.forEach(ctx._plugins, plugin => {
        this[plugin.name] = (...args) => {
          this._plugins.push({
            name: plugin.name,
            hooks: plugin.hooks,
            args: args
          });
          return this;
        };
      });
    }

    exec(cb) {
      return Promise.resolve()
        .then(() => execBeforePlugins.call(this))
        .then(() => ctx._connect())
        .then(conn => {
          let res = conn[this._op].apply(conn, this._args);
          if (res.toArray && (typeof res.toArray === 'function')) {
            return res.toArray();
          }
          return res;
        })
        .then(result => execAfterPlugins.call(this, result))
        .catch(e => addMongoErrorDetail.call(this, e))
        .asCallback(cb);
    }

    cursor(cb) {
      return Promise.resolve()
        .then(() => execBeforePlugins.call(this))
        .then(() => ctx._connect())
        .then(conn => conn[this._op].apply(conn, this._args))
        .then(result => execAfterPlugins.call(this, result))
        .catch(e => addMongoErrorDetail.call(this, e))
        .asCallback(cb);
    }

    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    }
  }

  function _bindMethod(propName) {
    Object.defineProperty(ctx, propName, {
      enumerable: true,
      value: (...args) => {
        if (args.length && ('function' === typeof args[args.length - 1])) {
          throw new TypeError('Not support callback for method: ' + propName + ', please call .exec() or .cursor()');
        }
        if (['find', 'findOne'].indexOf(propName) !== -1) {
          if (args.length > 2) {
            throw new TypeError('Only support this usage: ' + propName + '(query, options)');
          }
        }
        return new Query(propName, args);
      }
    });
    Object.defineProperty(ctx[propName], 'name', {
      value: propName
    });
  }

  function _bindGetter(propName) {
    ctx.__defineGetter__(propName, () => {
      return ctx._connect()
        .then(conn => {
          return conn[propName];
        });
    });
  }

  function _bindSetter(propName) {
    ctx.__defineSetter__(propName, value => {
      ctx._connect()
        .then(conn => {
          conn[propName] = value;
        });
    });
  }
};

function execBeforePlugins() {
  let self = this;
  let hookName = 'before' + _.upperFirst(this._op);
  let plugins = _.filter(this._plugins, plugin => plugin.hooks[hookName]);
  if (!plugins.length) {
    return;
  }
  return co(function* () {
    for (let plugin of plugins) {
      debug('%s %s before plugin %s: args -> %j', self._model._name, hookName, plugin.name, self._args);
      try {
        let value = plugin.hooks[hookName].apply(self, plugin.args);
        yield (isGenerator(value)
          ? value
          : Promise.resolve(value));
      } catch (e) {
        e.model = self._model._name;
        e.plugin = plugin.name;
        e.type = hookName;
        e.args = plugin.args;
        throw e;
      }
      debug('%s %s after plugin %s: args -> %j', self._model._name, hookName, plugin.name, self._args);
    }
  });
}

function execAfterPlugins(result) {
  let self = this;
  let hookName = 'after' + _.upperFirst(this._op);
  let plugins = _.filter(this._plugins, plugin => plugin.hooks[hookName]);
  if (!plugins.length) {
    return result;
  }
  return co(function* () {
    for (let plugin of plugins) {
      debug('%s %s before plugin %s: result -> %j', self._model._name, hookName, plugin.name, result);
      try {
        let value = plugin.hooks[hookName].apply(self, [result].concat(plugin.args));
        result = yield (isGenerator(value)
          ? value
          : Promise.resolve(value));
      } catch (e) {
        e.model = self._model._name;
        e.plugin = plugin.name;
        e.type = hookName;
        e.args = plugin.args;
        e.result = result;
        throw e;
      }
      debug('%s %s after plugin %s: result -> %j', self._model._name, hookName, plugin.name, result);
    }
    return result;
  });
}

function addMongoErrorDetail(e) {
  // concat extra error stack
  e.stack = `${e.stack}${os.EOL}----- Mongolass error stack -----${os.EOL}${this.stack}`;
  // only for mongoError
  if (!e.model) {
    e.op = this._op;
    e.args = this._args;
    e.model = this._model._name;
    e.schema = this._model._schema && this._model._schema._name;
  }
  debug(e);
  throw e;
}

function isGenerator(obj) {
  return obj
    && typeof obj.next === 'function'
    && typeof obj.throw === 'function';
}
