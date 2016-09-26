# Electrode Check Dependencies

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

This module provides function to check a `package.json`'s dependencies against another list to make sure the package doesn't deviates from a uniform dependencies.  This is mainly for ensuring React components use the same version of a common module when being consumed by an app.

## Install

```
npm install electrode-check-dependencies
```

## Usage

```js

const CheckDep = require("electrode-check-dependencies");

CheckDep.checkPkgFile( "<component_package.json>", "<uniform_dep.json>" ).catch( (err) => {
  console.log("component deviates from uniform dependencies");
});
```

or

```js

const CheckDep = require("electrode-check-dependencies");
const component = require("./package.json").dependencies;
const check = require("./check.json").dependencies;


const result = CheckDep.checkDependencies( component, check );
if ( result.unsatisfyCommon.length > 0 || result.unexpected.length > 0 ) {
  console.log("component deviates from uniform dependencies");
}
```

Built with :heart: by [Team Electrode](https://github.com/orgs/electrode-io/people) @WalmartLabs.

[npm-image]: https://badge.fury.io/js/electrode-check-dependencies.svg
[npm-url]: https://npmjs.org/package/electrode-check-dependencies
[travis-image]: https://travis-ci.org/electrode-io/electrode-check-dependencies.svg?branch=master
[travis-url]: https://travis-ci.org/electrode-io/electrode-check-dependencies
[daviddm-image]: https://david-dm.org/electrode-io/electrode-check-dependencies.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/electrode-io/electrode-check-dependencies
