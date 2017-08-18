"use strict";

const moment = require('moment');

const model = {
  dateParser: () => {
    return (req, res, next) => {
      model.parse(req.body);
      model.parse(req.query);
      next();
    }
  },

  bodyDateParser: () => {
    return (req, res, next) => {
      model.parse(req.body);
      next();
    }
  },

  queryDateParser: () => {
    return (req, res, next) => {
      model.parse(req.query);
      next();
    }
  },

  parse: (object) => {
    if (typeof object !== 'object' || object === null) return;

    for (let key in object) {
      // avoid circular reference infinite loop & skip inherited properties
      if (object === object[key] || !Object.prototype.hasOwnProperty.call(object, key) || typeof object[key] !== 'object') continue;
      model.parse(object[key]);
    }

    model._findAndReplace(object);
  },

  _findAndReplace: (object) => {
    let dateRegex = new RegExp("date", "ig");

    Object.keys(object).forEach((key) => {
      if (typeof object[key] !== 'boolean' && isNaN(object[key]) && moment(new Date(object[key])).isValid()) {
        object[key] = moment(object[key].toString()).toDate();
      } else if (!isNaN(object[key]) && dateRegex.test(key)) {
        let unixDateRegex = new RegExp("^\\d{10}(\\.\\d{0,3})?$");
        let millisecondsRegex = new RegExp("^\\d{13}$");

        if (unixDateRegex.test(object[key])) {
          object[key] = moment.unix(object[key]).toDate();
        } else if (millisecondsRegex.test(object[key])) {
          object[key] = moment(object[key]).toDate();
        }
      }
    });
  }

};

module.exports = model;
