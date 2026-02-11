type Request = { body?: Record<string, unknown>; query?: Record<string, unknown> };
type Response = Record<string, unknown>;
type NextFunction = () => void;
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

const STRICT_DATE_REGEX: RegExp = /date/i;
const UNIX_DATE_REGEX: RegExp = /^\d{10}(\.\d{0,3})?$/;
const MILLISECONDS_REGEX: RegExp = /^\d{13}$/;

const isValid = (dateObj: Date): boolean => dateObj.getTime() === dateObj.getTime();

function _findAndReplace(object: Record<string, unknown>, strict: boolean): Record<string, unknown> {
  strict = strict !== false;

  Object.keys(object).forEach((key) => {
    const value = object[key];
    if (
      isNaN(value as number) &&
      (!strict || !isNaN(key as unknown as number) || STRICT_DATE_REGEX.test(key))
    ) {
      const dateObj = new Date(value as string);
      if (isValid(dateObj)) {
        object[key] = dateObj;
      }
    } else if (!isNaN(value as number) && (!strict || STRICT_DATE_REGEX.test(key))) {
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
  if (isNaN(value as number)) {
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

export function parse(object: Record<string, unknown>, strict?: boolean): Record<string, unknown>;
export function parse(object: unknown, strict?: boolean): unknown;
export function parse(object: unknown, strict?: boolean): unknown {
  if (typeof object !== 'object' || object === null) {
    return _parseValue(object);
  }

  const obj = object as Record<string, unknown>;

  Object.keys(obj)
    .filter((key) => obj[key] !== obj && typeof obj[key] === 'object')
    .forEach((key) => {
      obj[key] = parse(obj[key] as Record<string, unknown>, strict);
    });

  _findAndReplace(obj, strict as boolean);

  return obj;
}

export const dateParser = (strict?: boolean): Middleware => {
  return (req, res, next) => {
    parse(req.body, strict);
    parse(req.query, strict);
    next();
  };
};

export const bodyDateParser = (strict?: boolean): Middleware => {
  return (req, res, next) => {
    parse(req.body, strict);
    next();
  };
};

export const queryDateParser = (strict?: boolean): Middleware => {
  return (req, res, next) => {
    parse(req.query, strict);
    next();
  };
};

export default { dateParser, bodyDateParser, queryDateParser, parse };
