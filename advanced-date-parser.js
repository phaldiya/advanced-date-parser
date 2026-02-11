const STRICT_DATE_REGEX = /date/i;
const UNIX_DATE_REGEX = /^\d{10}(\.\d{0,3})?$/;
const MILLISECONDS_REGEX = /^\d{13}$/;

const isValid = function (dateObj) {
  return dateObj.getTime() === dateObj.getTime();
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

    Object.keys(object)
      .filter(key => object[key] !== object && typeof object[key] === 'object')
      .forEach(key => {
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
        (!strict || !isNaN(key) || STRICT_DATE_REGEX.test(key))
      ) {
        const dateObj = new Date(object[key]);
        if (isValid(dateObj)) {
          object[key] = dateObj;
        }
      } else if (!isNaN(object[key]) && (!strict || STRICT_DATE_REGEX.test(key))) {
        if (UNIX_DATE_REGEX.test(object[key])) {
          object[key] = new Date(Number.parseFloat(object[key]) * 1000);
        } else if (MILLISECONDS_REGEX.test(object[key])) {
          object[key] = new Date(Number.parseInt(object[key], 10));
        }
      }
    });

    return object;
  },

  _parseValue: (value) => {
    if (isNaN(value)) {
      const dateObj = new Date(value);
      if (isValid(dateObj)) {
        return dateObj;
      }
    } else {
      if (UNIX_DATE_REGEX.test(value)) {
        return new Date(Number.parseFloat(value) * 1000);
      } else if (MILLISECONDS_REGEX.test(value)) {
        return new Date(Number.parseInt(value, 10));
      }
    }

    return value;
  },
};

module.exports = model;
