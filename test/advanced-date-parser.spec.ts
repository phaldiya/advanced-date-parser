import { describe, it, expect, vi } from 'vitest';
import dateParser from '../src/index';

describe('Date Parser', () => {
  it('should parse the object with date params', () => {
    const req = {
      query: {
        term: 'express',
        startDate: '2017-10-01',
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      startDate: new Date('2017-10-01'),
    });

    expect(req.query.startDate instanceof Date).toBeTruthy();
  });

  it('should parse the object with date params in not strict mode', () => {
    const req = {
      query: {
        term: 'express',
        from: '2017-10-01',
        to: '2017-10-31',
      },
    };

    dateParser.parse(req.query, false);

    expect(req.query).toStrictEqual({
      term: 'express',
      from: new Date('2017-10-01'),
      to: new Date('2017-10-31'),
    });

    expect(req.query.from instanceof Date).toBeTruthy();
    expect(req.query.to instanceof Date).toBeTruthy();
  });

  it('should parse the deep object with date params', () => {
    const req = {
      query: {
        term: 'express',
        metaData: {
          startDate: '2017-10-01 00:00:00',
        },
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      metaData: {
        startDate: new Date('2017-10-01 00:00:00'),
      },
    });

    expect((req.query.metaData as Record<string, unknown>).startDate instanceof Date).toBeTruthy();
  });

  it('should parse the object with Array of dates', () => {
    const req = {
      query: {
        term: 'express',
        dates: ['Friday, June 24, 2016 10:42 AM', '2017-08-11T00:00:00.000Z'],
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      dates: [
        new Date('Friday, June 24, 2016 10:42 AM'),
        new Date('2017-08-11T00:00:00.000Z'),
      ],
    });

    expect((req.query.dates as unknown[])[0] instanceof Date).toBeTruthy();
    expect((req.query.dates as unknown[])[1] instanceof Date).toBeTruthy();
  });

  it('should parse the milliseconds style date', () => {
    const req = {
      query: {
        term: 'express',
        startDate: '1501781876406',
        endDate: 1602053999999,
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      startDate: new Date('2017-08-03T17:37:56.406Z'),
      endDate: new Date('2020-10-07T06:59:59.999Z'),
    });

    expect(req.query.startDate instanceof Date).toBeTruthy();
  });

  it('should parse the unix style date', () => {
    const req = {
      query: {
        term: 'express',
        startDate: '1501781876.406',
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      startDate: new Date('2017-08-03T17:37:56.406Z'),
    });

    expect(req.query.startDate instanceof Date).toBeTruthy();
  });

  it("should skip to parse the attribute if it doesn't contains text date", () => {
    const req = {
      query: {
        term: 'express',
        start: 1501781876.406,
      },
    };

    dateParser.parse(req.query);

    expect(req.query.start instanceof Date).toBeFalsy();
    expect(req.query.start).toEqual(1501781876.406);
  });

  it("should parse the attribute if strict flag is 'false'", () => {
    const req = {
      query: {
        term: 'express',
        start: 1501781876.406,
      },
    };

    dateParser.parse(req.query, false);

    expect(req.query.start instanceof Date).toBeTruthy();
    expect(req.query.start).toEqual(new Date('2017-08-03T17:37:56.406Z'));
  });

  it('should parse the invalid date', () => {
    const req = {
      query: {
        term: 'express',
        startDate: 'today',
      },
    };

    dateParser.parse(req.query);

    expect(req.query).toStrictEqual({
      term: 'express',
      startDate: 'today',
    });

    expect(req.query.startDate instanceof Date).toBeFalsy();
  });

  it('should parse the date string', () => {
    const date = '2020-01-01';

    expect(dateParser.parse(date) instanceof Date).toBeTruthy();
    expect(dateParser.parse(date)).toEqual(new Date('2020-01-01'));
  });

  describe('middleware', () => {
    it('dateParser should parse both body and query', () => {
      const req = {
        body: { startDate: '2020-01-01' },
        query: { endDate: '2020-12-31' },
      };
      const next = vi.fn();

      dateParser.dateParser()(req as any, {} as any, next);

      expect(req.body.startDate).toEqual(new Date('2020-01-01'));
      expect(req.query.endDate).toEqual(new Date('2020-12-31'));
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('bodyDateParser should parse only body', () => {
      const req = {
        body: { startDate: '2020-01-01' },
        query: { endDate: '2020-12-31' },
      };
      const next = vi.fn();

      dateParser.bodyDateParser()(req as any, {} as any, next);

      expect(req.body.startDate).toEqual(new Date('2020-01-01'));
      expect(req.query.endDate).toBe('2020-12-31');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('queryDateParser should parse only query', () => {
      const req = {
        body: { startDate: '2020-01-01' },
        query: { endDate: '2020-12-31' },
      };
      const next = vi.fn();

      dateParser.queryDateParser()(req as any, {} as any, next);

      expect(req.body.startDate).toBe('2020-01-01');
      expect(req.query.endDate).toEqual(new Date('2020-12-31'));
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('dateParser should respect strict flag', () => {
      const req = {
        body: { from: '2020-01-01' },
        query: { to: '2020-12-31' },
      };
      const next = vi.fn();

      dateParser.dateParser(false)(req as any, {} as any, next);

      expect(req.body.from).toEqual(new Date('2020-01-01'));
      expect(req.query.to).toEqual(new Date('2020-12-31'));
    });
  });

  describe('edge cases', () => {
    it('should return null as-is', () => {
      expect(dateParser.parse(null)).toBeNull();
    });

    it('should return undefined as-is', () => {
      expect(dateParser.parse(undefined)).toBeUndefined();
    });

    it('should return empty object as-is', () => {
      const obj = {};
      expect(dateParser.parse(obj)).toStrictEqual({});
    });

    it('should not convert boolean values', () => {
      const obj: Record<string, unknown> = { startDate: true, endDate: false };
      dateParser.parse(obj);

      expect(obj.startDate).toBe(true);
      expect(obj.endDate).toBe(false);
    });

    it('should not convert empty string values', () => {
      const obj: Record<string, unknown> = { startDate: '' };
      dateParser.parse(obj);

      expect(obj.startDate).toBe('');
    });

    it('should handle already-Date object values', () => {
      const date = new Date('2020-06-15');
      const obj: Record<string, unknown> = { startDate: date };
      dateParser.parse(obj);

      expect(obj.startDate instanceof Date).toBeTruthy();
      expect(obj.startDate).toEqual(new Date('2020-06-15'));
    });

    it('should handle circular references without infinite loop', () => {
      const obj: Record<string, unknown> = { startDate: '2020-01-01' };
      obj.self = obj;

      dateParser.parse(obj);

      expect(obj.startDate).toEqual(new Date('2020-01-01'));
      expect(obj.self).toBe(obj);
    });
  });
});
