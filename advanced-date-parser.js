const strictDateRegex = function () {
  return new RegExp('date', 'ig');
};
const unixDateRegex = function () {
  return new RegExp('^\\d{10}(\\.\\d{0,3})?$');
};
const millisecondsRegex = function () {
  return new RegExp('^\\d{13}$');
};

const isValid = function (date) {
  // If the date object is invalid it will return 'NaN' on getTime() and NaN is never equal to itself.
  const dateObj = new Date(date);
  return dateObj && dateObj.getTime() === dateObj.getTime();
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
    if (typeof object !== 'object' || object === null) {
      return model._parseValue(object);
    }

    Object.keys(object).filter(key => !(object === object[key] ||
      !Object.prototype.hasOwnProperty.call(object, key) ||
      typeof object[key] !== 'object')).forEach(key => {
        object[key] = model.parse(object[key], strict);
      });

    model._findAndReplace(object, strict);

    return object;
  },

  _findAndReplace: (object, strict) => {
    strict = strict !== false;

    Object.keys(object).forEach((key) => {
      if (
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

    return object;
  },

  _parseValue: (value) => {
    if (
      isNaN(value) &&
      isValid(new Date(value))
    ) {
      return new Date(value);
    } else if (!isNaN(value)) {
      if (unixDateRegex().test(value)) {
        return new Date(Number.parseFloat(value, 10) * 1000);
      } else if (millisecondsRegex().test(value)) {
        return new Date(Number.parseInt(value, 10));
      }
    }

    return value;
  },
};

module.exports = model;
