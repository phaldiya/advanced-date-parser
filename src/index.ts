type Request = { body?: Record<string, unknown>; query?: Record<string, unknown> };
type Response = Record<string, unknown>;
type NextFunction = () => void;
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

const STRICT_DATE_REGEX: RegExp = /date/i;
const UNIX_DATE_REGEX: RegExp = /^\d{10}(\.\d{0,3})?$/;
const MILLISECONDS_REGEX: RegExp = /^\d{13}$/;

const isValid = (dateObj: Date): boolean => !Number.isNaN(dateObj.getTime());

// Uses Number() coercion on purpose: a non-numeric string like '2020-01-01' coerces to NaN,
// which is how we distinguish date strings from numeric timestamps.
const isNotNumeric = (value: unknown): boolean => Number.isNaN(Number(value));

function _findAndReplace(
  object: Record<string, unknown>,
  strict: boolean,
): Record<string, unknown> {
  strict = strict !== false;

  Object.keys(object).forEach((key) => {
    const value = object[key];
    if (isNotNumeric(value) && (!strict || !isNotNumeric(key) || STRICT_DATE_REGEX.test(key))) {
      const dateObj = new Date(value as string);
      if (isValid(dateObj)) {
        object[key] = dateObj;
      }
    } else if (!isNotNumeric(value) && (!strict || STRICT_DATE_REGEX.test(key))) {
      const strValue = String(value);
      if (UNIX_DATE_REGEX.test(strValue)) {
        object[key] = new Date(Number.parseFloat(strValue) * 1000);
      } else if (MILLISECONDS_REGEX.test(strValue)) {
        object[key] = new Date(Number.parseInt(strValue, 10));
      }
    }
  });

  return object;
}

function _parseValue(value: unknown): unknown {
  if (isNotNumeric(value)) {
    const dateObj = new Date(value as string);
    if (isValid(dateObj)) {
      return dateObj;
    }
  } else {
    const strValue = String(value);
    if (UNIX_DATE_REGEX.test(strValue)) {
      return new Date(Number.parseFloat(strValue) * 1000);
    } else if (MILLISECONDS_REGEX.test(strValue)) {
      return new Date(Number.parseInt(strValue, 10));
    }
  }

  return value;
}

function _parseDeep(object: unknown, strict: boolean | undefined, seen: WeakSet<object>): unknown {
  if (typeof object !== 'object' || object === null) {
    return _parseValue(object);
  }

  const obj = object as Record<string, unknown>;

  // Guard against circular references (direct or indirect) to avoid infinite recursion
  if (seen.has(obj)) {
    return obj;
  }
  seen.add(obj);

  Object.keys(obj)
    .filter((key) => typeof obj[key] === 'object' && obj[key] !== null)
    .forEach((key) => {
      obj[key] = _parseDeep(obj[key], strict, seen);
    });

  _findAndReplace(obj, strict as boolean);

  return obj;
}

export function parse(object: Record<string, unknown>, strict?: boolean): Record<string, unknown>;
export function parse(object: unknown, strict?: boolean): unknown;
export function parse(object: unknown, strict?: boolean): unknown {
  return _parseDeep(object, strict, new WeakSet());
}

export const dateParser = (strict?: boolean): Middleware => {
  return (req, _res, next) => {
    parse(req.body, strict);
    parse(req.query, strict);
    next();
  };
};

export const bodyDateParser = (strict?: boolean): Middleware => {
  return (req, _res, next) => {
    parse(req.body, strict);
    next();
  };
};

export const queryDateParser = (strict?: boolean): Middleware => {
  return (req, _res, next) => {
    parse(req.query, strict);
    next();
  };
};

export default { dateParser, bodyDateParser, queryDateParser, parse };
