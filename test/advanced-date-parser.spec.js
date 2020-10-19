const { expect } = require('chai');
const moment = require('moment');
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

    expect(req.query).to.deep.equal({
      term: 'express',
      startDate: moment('2017-10-01').toDate(),
    });

    expect(req.query.startDate instanceof Date).to.equal(true);
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

    expect(req.query).to.deep.equal({
      term: 'express',
      from: moment('2017-10-01').toDate(),
      to: moment('2017-10-31').toDate(),
    });

    expect(req.query.from instanceof Date).to.equal(true);
    expect(req.query.to instanceof Date).to.equal(true);
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

    expect(req.query).to.deep.equal({
      term: 'express',
      metaData: {
        startDate: moment('2017-10-01').toDate(),
      },
    });

    expect(req.query.metaData.startDate instanceof Date).to.equal(true);
  });

  it('should parse the object with Array of dates', () => {
    const req = {
      query: {
        term: 'express',
        dates: ['Friday, June 24, 2016 10:42 AM', '2017-08-11T00:00:00.000Z'],
      },
    };

    dateParser.parse(req.query);

    expect(req.query).to.deep.equal({
      term: 'express',
      dates: [
        moment('Friday, June 24, 2016 10:42 AM', 'LLLL', true).toDate(),
        moment('2017-08-11T00:00:00.000Z').toDate(),
      ],
    });

    expect(req.query.dates[0] instanceof Date).to.equal(true);
    expect(req.query.dates[1] instanceof Date).to.equal(true);
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

    expect(req.query).to.deep.equal({
      term: 'express',
      startDate: moment('2017-08-03T17:37:56.406Z').toDate(),
      endDate: moment('2020-10-07T06:59:59.999Z').toDate(),
    });

    expect(req.query.startDate instanceof Date).to.equal(true);
  });

  it('should parse the unix style date', () => {
    const req = {
      query: {
        term: 'express',
        startDate: '1501781876.406',
      },
    };

    dateParser.parse(req.query);

    expect(req.query).to.deep.equal({
      term: 'express',
      startDate: moment('2017-08-03T17:37:56.406Z').toDate(),
    });

    expect(req.query.startDate instanceof Date).to.equal(true);
  });

  it("should skip to parse the attribute if it doesn't contains text date", () => {
    const req = {
      query: {
        term: 'express',
        start: 1501781876.406,
      },
    };

    dateParser.parse(req.query);

    expect(req.query.start instanceof Date).to.equal(false);
    expect(req.query.start).to.equal(1501781876.406);
  });
});
