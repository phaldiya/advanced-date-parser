const dateParser = require('../advanced-date-parser');

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

    expect(req.query.startDate instanceof Date).toBeTruthy()
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

    expect(req.query.from instanceof Date).toBeTruthy()
    expect(req.query.to instanceof Date).toBeTruthy()
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

    expect(req.query.metaData.startDate instanceof Date).toBeTruthy()
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

    expect(req.query.dates[0] instanceof Date).toBeTruthy()
    expect(req.query.dates[1] instanceof Date).toBeTruthy()
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

    expect(req.query.startDate instanceof Date).toBeTruthy()
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

    expect(req.query.startDate instanceof Date).toBeTruthy()
  });

  it("should skip to parse the attribute if it doesn't contains text date", () => {
    const req = {
      query: {
        term: 'express',
        start: 1501781876.406,
      },
    };

    dateParser.parse(req.query);

    expect(req.query.start instanceof Date).toBeFalsy()
    expect(req.query.start).toEqual(1501781876.406);
  });
});
