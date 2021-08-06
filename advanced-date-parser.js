const { isValid } = require('date-fns');

const strictDateRegex = function () {
  return new RegExp('date', 'ig');
};
const unixDateRegex = function () {
  return new RegExp('^\\d{10}(\\.\\d{0,3})?$');
};
const millisecondsRegex = function () {
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
        isValid(new Date(object[key]))
      ) {
        object[key] = new Date(object[key]);
      } else if (!isNaN(object[key]) && (!strict || strictDateRegex().test(key))) {
        if (unixDateRegex().test(object[key])) {
          object[key] = new Date(Number.parseFloat(object[key], 10) * 1000);
        } else if (millisecondsRegex().test(object[key])) {
          object[key] = new Date(Number.parseInt(object[key], 10));
        }
      }
    });
  },
};

module.exports = model;
