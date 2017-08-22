"use strict";

const moment = require('moment');
const supportedDateFormates = ["YYYY-MM-DD", "MM/DD/YYYY", "MM-DD-YYYY", "DD/MM/YYYY", "YYYY-MM-DD H:mm", "YYYY-MM-DDTH:mm:ss.sssZ", "YYYY-MM-DDTH:mm:ssZ", "YYYY-MM-DD h:mm:ss a",
  moment.ISO_8601, "X", "x", "MMM Do, YYYY", "MMM Do YYYY", "MMMM Do, YYYY", "MMMM Do YYYY", "dddd, MMMM DD, YYYY h:mm a", "ddd, MMMM DD, YYYY h:mm a"];

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
      if (typeof object[key] !== 'boolean' && isNaN(object[key]) && moment(object[key], supportedDateFormates, true).isValid()) {
        object[key] = moment(object[key], supportedDateFormates, true).toDate();
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
