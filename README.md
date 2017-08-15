advanced-date-parser
=====================

> an date parser middleware, to parse date into Javascript Date Objects


## Getting started ##

### Prerequisites
If you do not have nodejs installed on your machine, download and install [NodeJS](http://nodejs.org/). (NodeJS > 6.x Required)<br/>


### Installation
Install advanced-date-parser npm package [advanced-date-parser](https://www.npmjs.org/package/advanced-date-parser)</a>:<br/>

**With NPM:**

```
$ cd <project path>
npm install --save advanced-date-parser
```


##  How to use

```javascript
// create a variable into server.js
const dateParser = require('advanced-date-parser');
```
It can be used in many different ways
* To parse only query params
```javascript
app.use(dateParser.queryDateParser());
```

* To parse only request body
```javascript
app.use(dateParser.bodyDateParser());
```

* To parse both query and request body
```javascript
app.use(dateParser.dateParser());
```

* Also can be use to parse any date attributes into the Object
```javascript
dateParser.parse(<Your_Object>);
```

## Contributing
* If you planning add some feature please **create issue before**.
* Don't forget about tests.

Clone the project: <br/>
```bash
$ git clone
$ npm install
```
Run the tests:
```bash
$ mocha
```
**Deploy:**<br/>
Update version before (package)
```bash
$ git tag v*.*.*
$ git push origin master --tags
```

## Issues
If you do find an issue or have a question consider posting it on the [Issues](https://github.com/phaldiya/advanced-date-parser/issues).
