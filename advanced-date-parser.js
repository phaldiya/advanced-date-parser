const moment = require('moment');

const supportedDateFormates = [
  'YYYY-MM-DD',
  'MM/DD/YYYY',
  'MM-DD-YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD H:mm',
  'YYYY-MM-DDTH:mm:ss.sssZ',
  'YYYY-MM-DDTH:mm:ssZ',
  'YYYY-MM-DD h:mm:ss a',
  moment.ISO_8601,
  'X',
  'x',
  'MMM Do, YYYY',
  'MMM Do YYYY',
  'MMMM Do, YYYY',
  'MMMM Do YYYY',
  'dddd, MMMM DD, YYYY h:mm a',
  'ddd, MMMM DD, YYYY h:mm a',
  'L',
  'LL',
  'LLL',
  'LLLL',
];

const strictDateRegex = function() {
  return new RegExp('date', 'ig');
};
const unixDateRegex = function() {
  return new RegExp('^\\d{10}(\\.\\d{0,3})?$');
};
const millisecondsRegex = function() {
  return new RegExp('^\\d{13}$');
};

const model = {
  dateParser: (strict) => {
    return (req, res, next) => {
      model.parse(req.body, strict);
      model.parse(req.query, strict);
      next();
    };
  },

  bodyDateParser: (strict) => {
    return (req, res, next) => {
      model.parse(req.body, strict);
      next();
    };
  },

  queryDateParser: (strict) => {
    return (req, res, next) => {
      model.parse(req.query, strict);
      next();
    };
  },

  parse: (object, strict) => {
    if (typeof object !== 'object' || object === null) return;

    for (const key in object) {
      // avoid circular reference infinite loop & skip inherited properties
      if (
        object === object[key] ||
        !Object.prototype.hasOwnProperty.call(object, key) ||
        typeof object[key] !== 'object'
      )
        continue;
      model.parse(object[key], strict);
    }

    model._findAndReplace(object, strict);

    return object;
  },

  _findAndReplace: (object, strict) => {
    strict = strict !== false;

    Object.keys(object).forEach((key) => {
      if (
        typeof object[key] !== 'boolean' &&
        isNaN(object[key]) &&
        (!strict || !isNaN(key) || strictDateRegex().test(key)) &&
        moment(object[key], supportedDateFormates, true).isValid()
      ) {
        object[key] = moment(object[key], supportedDateFormates, true).toDate();
      } else if (!isNaN(object[key]) && (!strict || strictDateRegex().test(key))) {
        if (unixDateRegex().test(object[key])) {
          object[key] = moment.unix(object[key]).toDate();
        } else if (millisecondsRegex().test(object[key])) {
          object[key] = moment(object[key], 'x').toDate();
        }
      }
    });
  },
};

module.exports = model;
