# advanced-date-parser

[![Build and Release](https://github.com/phaldiya/advanced-date-parser/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/phaldiya/advanced-date-parser/actions/workflows/build-and-release.yml)
[![npm version](https://img.shields.io/npm/v/advanced-date-parser.svg)](https://www.npmjs.com/package/advanced-date-parser)
[![npm downloads](https://img.shields.io/npm/dm/advanced-date-parser.svg)](https://www.npmjs.com/package/advanced-date-parser)
[![Types](https://img.shields.io/npm/types/advanced-date-parser.svg)](https://www.npmjs.com/package/advanced-date-parser)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/advanced-date-parser?activeTab=dependencies)
[![License: MIT](https://img.shields.io/npm/l/advanced-date-parser.svg)](https://github.com/phaldiya/advanced-date-parser/blob/master/LICENSE.md)

> Automatically convert date-like strings and timestamps into native JavaScript `Date` objects — as an Express middleware or a standalone utility.

Incoming request data is always strings. `?startDate=2020-01-01` reaches your handler as `"2020-01-01"`, not a `Date`. **advanced-date-parser** walks an object (or a whole request body/query) and replaces date-like values with real `Date` instances, so your handlers and validators get typed dates for free.

---

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Usage](#usage)
  - [As Express middleware](#as-express-middleware)
  - [As a standalone utility](#as-a-standalone-utility)
- [Strict mode](#strict-mode)
- [Supported formats](#supported-formats)
- [API](#api)
- [TypeScript](#typescript)
- [Behavior & guarantees](#behavior--guarantees)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🧩 **Express middleware** — parse `req.body`, `req.query`, or both.
- 🔧 **Standalone utility** — parse any object or value, deeply and recursively.
- 🎯 **Smart, opt-out strict mode** — only touch keys that look like dates by default.
- 🕒 **Multiple formats** — ISO 8601 strings, Unix seconds, and millisecond timestamps.
- 📦 **Zero runtime dependencies.**
- 🟦 **First-class TypeScript** — ships full type definitions.
- ♻️ **Dual ESM / CJS** — works with both `import` and `require`.

## Installation

```bash
npm install advanced-date-parser
# or
yarn add advanced-date-parser
# or
pnpm add advanced-date-parser
# or
bun add advanced-date-parser
```

**Requirements:** Node.js **>= 22**.

## Quick start

```typescript
import { parse } from 'advanced-date-parser';

parse({ startDate: '2020-01-01' });
// → { startDate: Date('2020-01-01T00:00:00.000Z') }

parse('1501781876406'); // millisecond timestamp
// → Date('2017-08-03T17:37:56.406Z')
```

```javascript
// CommonJS
const { parse } = require('advanced-date-parser');
```

## Usage

### As Express middleware

Register a middleware and every matching value on the request is converted to a `Date` before your route handler runs.

```typescript
import express from 'express';
import { dateParser, bodyDateParser, queryDateParser } from 'advanced-date-parser';

const app = express();
app.use(express.json());

// Parse both req.body and req.query
app.use(dateParser());

// …or scope it:
app.use(queryDateParser()); // only req.query
app.use(bodyDateParser());  // only req.body

app.get('/events', (req, res) => {
  // GET /events?startDate=2020-01-01
  req.query.startDate instanceof Date; // → true
  res.json({ ok: true });
});
```

### As a standalone utility

`parse()` works on any object or value — not just requests. It walks nested objects and arrays recursively, **mutating the input in place** and also returning it.

```typescript
import { parse } from 'advanced-date-parser';

const filter = {
  term: 'express',
  range: {
    from: '2017-10-01',
    to: '2017-10-31',
  },
  timestamps: ['2017-08-11T00:00:00.000Z', 'Friday, June 24, 2016 10:42 AM'],
};

parse(filter);
// filter.range.from      → Date
// filter.range.to        → Date
// filter.timestamps[0]   → Date
// filter.timestamps[1]   → Date
// filter.term            → 'express' (unchanged)
```

## Strict mode

Every function accepts an optional `strict` boolean (**default: `true`**) that controls *which* values get parsed.

| Mode | Behavior |
| --- | --- |
| **Strict** (default) | Only parse values whose key matches `/date/i` (e.g. `date`, `startDate`, `DATE_OF_BIRTH`). String values inside arrays are also parsed. |
| **Non-strict** (`false`) | Parse **every** value that looks like a date, regardless of its key. |

```typescript
// Strict: only `startDate` is a date-like key, so only it is converted.
parse({ startDate: '2020-01-01', note: '2020-05-05' });
// → { startDate: Date, note: '2020-05-05' }

// Non-strict: both values are converted.
parse({ startDate: '2020-01-01', note: '2020-05-05' }, false);
// → { startDate: Date, note: Date }
```

Pass `false` to any middleware the same way:

```typescript
app.use(dateParser(false));
app.use(bodyDateParser(false));
app.use(queryDateParser(false));
```

## Supported formats

| Input | Example | Result |
| --- | --- | --- |
| ISO 8601 / any `Date`-parseable string | `'2017-08-11T00:00:00.000Z'`, `'2020-01-01'` | `Date` |
| Unix timestamp (seconds, 10 digits) | `'1501781876'`, `'1501781876.406'` | `Date` |
| Millisecond timestamp (13 digits) | `'1501781876406'`, `1501781876406` | `Date` |
| Unparseable / non-date string | `'today'`, `'express'`, `''` | *unchanged* |
| Booleans, `null`, existing `Date` | `true`, `null`, `new Date()` | *unchanged* |

## API

All functions are available as named exports and on the default export.

```typescript
import dateParser, { parse, dateParser as dp, bodyDateParser, queryDateParser } from 'advanced-date-parser';
```

### `parse(input, strict?)`

Recursively converts date-like values in `input`. Objects and arrays are traversed and **mutated in place**; the same reference is returned. A scalar input is returned as a `Date` if it is date-like, otherwise unchanged.

- `input: unknown` — object, array, or scalar value.
- `strict?: boolean` — default `true`. See [Strict mode](#strict-mode).
- **Returns:** the parsed input.

### `dateParser(strict?)`

Returns an Express middleware that parses both `req.body` and `req.query`.

### `bodyDateParser(strict?)`

Returns an Express middleware that parses only `req.body`.

### `queryDateParser(strict?)`

Returns an Express middleware that parses only `req.query`.

Each middleware has the signature `(req, res, next) => void` and calls `next()` when done.

## TypeScript

Type definitions are bundled — no `@types/*` package needed.

```typescript
import { parse } from 'advanced-date-parser';

const result = parse({ startDate: '2020-01-01' });
//    ^? Record<string, unknown>
```

## Behavior & guarantees

- **In-place mutation.** `parse()` modifies the object you pass in and returns the same reference. Clone first if you need immutability.
- **Deep traversal.** Nested objects and arrays are parsed recursively.
- **Circular-reference safe.** Direct and indirect cycles are detected and skipped — no infinite recursion.
- **Non-destructive on non-dates.** Values that don't match a supported format are left exactly as they are.
- **Time zones.** Date-only strings (e.g. `'2020-01-01'`) follow native `new Date()` semantics and are interpreted as UTC; strings with a time component follow standard `Date` parsing rules.

## Contributing

Contributions are welcome!

- Planning a feature? **Open an issue first** to discuss it.
- Include tests with your change.

```bash
git clone https://github.com/phaldiya/advanced-date-parser.git
cd advanced-date-parser
bun install

bun run build      # build with tsup
bun run test       # run the test suite
bun run typecheck  # type-check with tsc
bun run lint       # lint & format check with Biome
bun run lint:fix   # apply safe lint/format fixes
```

Found a bug or have a question? Open one on the [issue tracker](https://github.com/phaldiya/advanced-date-parser/issues).

## License

[MIT](./LICENSE.md) © Pradeep K Haldiya
