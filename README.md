advanced-date-parser
=====================

[![Build and Release](https://github.com/phaldiya/advanced-date-parser/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/phaldiya/advanced-date-parser/actions/workflows/build-and-release.yml) [![npm version](https://img.shields.io/npm/v/advanced-date-parser.svg)](https://www.npmjs.com/package/advanced-date-parser) [![npm downloads](https://img.shields.io/npm/dm/advanced-date-parser.svg)](https://www.npmjs.com/package/advanced-date-parser) [![License: MIT](https://img.shields.io/npm/l/advanced-date-parser.svg)](https://github.com/phaldiya/advanced-date-parser/blob/master/LICENSE.md)
* Zero dependencies
* Written in TypeScript with full type definitions
* Dual ESM/CJS package — works with `import` and `require`
* A date parser middleware, to parse date into Javascript Date Objects
* Javascript/TypeScript utility to parse date attributes into date objects


## Getting started ##

### Prerequisites
[Node.js](http://nodejs.org/) >= 18

### Installation

```bash
npm install advanced-date-parser
```

##  How to use

```javascript
// CommonJS
const dateParser = require('advanced-date-parser');
```

```typescript
// ESM / TypeScript
import dateParser from 'advanced-date-parser';
// or named imports
import { parse, dateParser, bodyDateParser, queryDateParser } from 'advanced-date-parser';
```

It can be used in many different ways:

* To parse only query params
```javascript
app.use(queryDateParser());
```

* To parse only request body
```javascript
app.use(bodyDateParser());
```

* To parse both query and request body
```javascript
app.use(dateParser());
```

* Also can be used to parse any date attributes in an object or value
```javascript
parse({ startDate: '2020-01-01' });
parse('2020-01-01');
parse('1501781876.406'); // unix timestamp
parse('1501781876406'); // milliseconds
```

**NOTE**: Set _**strict**_ mode to _**false**_ if you want to parse all date values regardless of key name:
```javascript
app.use(queryDateParser(false));
app.use(bodyDateParser(false));
app.use(dateParser(false));
parse(object, false);
```

In strict mode (default), only keys matching `/date/i` or numeric keys are parsed. In non-strict mode, all values that look like dates are converted.

## Contributing
* If you are planning to add a feature, please **create an issue first**.
* Don't forget about tests.

Clone the project and install dependencies:
```bash
git clone https://github.com/phaldiya/advanced-date-parser.git
cd advanced-date-parser
bun install
```

Build:
```bash
bun run build
```

Run the tests:
```bash
bun run test
```

Type check:
```bash
bun run typecheck
```

## Issues
If you find an issue or have a question consider posting it on the [Issues](https://github.com/phaldiya/advanced-date-parser/issues).
