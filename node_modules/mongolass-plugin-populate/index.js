'use strict';

const _ = require('lodash');

module.exports = {
  afterFind: function (results, opt) {
    return bindPopulate.call(this, results, opt);
  },
  afterFindOne: function (result, opt) {
    return bindPopulate.call(this, [result], opt).then(result => result[0] || null);
  }
};

function bindPopulate(results, opt) {
  if (!opt.path || !opt.model) {
    throw new TypeError('No .populate path or model');
  }
  if (!results.length) {
    return results;
  }
  let keys = _.map(results, opt.path);
  let query = opt.match || {};
  let options = {};
  let omitId = false;
  query._id = { $in: keys };
  if (opt.select) {
    options.fields = opt.select;
    if (options.fields._id === 0) {
      omitId = true;
      if (Object.keys(options.fields).length > 1) {
        options.fields._id = 1;
      } else {
        delete options.fields._id;
      }
    }
  }
  let model = ('string' === typeof opt.model) ? this._model.model(opt.model, null, opt.options) : opt.model;
  return model
    .find(query, options)
    .exec()
    .then(populates => {
      return _.reduce(populates, function(obj, value) {
        obj[value._id.toString()] = value;
        return obj;
      }, {});
    })
    .then(obj => {
      _.forEach(results, result => {
        let refe = _.get(result, opt.path);
        try { refe = refe.toString(); } catch (e) {}
        if (refe && obj[refe]) {
          if (omitId) delete obj[refe]._id;
          _.set(result, opt.path, obj[refe]);
        }
      });
      return results;
    });
}
