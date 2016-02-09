"use strict";
const Promise = require("bluebird");
const Path = require("path");
const _ = require("lodash");
const assert = require("assert");
const Semver = require("semver");

function checkDependencies(component, check, options) {
  assert(_.isObject(component), "component dependencies missing");
  assert(_.isObject(check), "dependencies check list missing");

  const wantNames = Object.keys(component);
  const expectNames = Object.keys(check);
  const common = _.intersection(wantNames, expectNames);
  const isWml = (name) => name.startsWith("@walmart");

  const unsatisfyCommon = common.filter((n) => !isWml(n)).map((name) => {

    const want = component[name];
    const expected = check[name];
    const wantRange = new Semver.Range(want);

    // version must have a finite range.  ie: can't have * or latest
    // do not allow multiple ranges. ie: can't have ^1.0.0 || ^2.0.0
    if (!wantRange || wantRange.set.length !== 1) {
      return {name, want, expected};
    }

    const expectedRange = new Semver.Range(expected);
    const wantMax = wantRange.set[0][1].toString();
    const expectedMax = expectedRange.set[0][1].toString();

    // the max version in the range must equal
    // don't care about min version since NPM will always match latest available less than max
    if (wantMax !== expectedMax) {
      return {name, want, expected};
    }

    return undefined;

  }).filter(_.identity);

  const unexpected = !(options && options.allowExtra) && wantNames.filter((n) => (!isWml(n) && !check[n])) || [];

  return {unsatisfyCommon, unexpected};
}


function checkPkgFile(pkgFile, checkFile, options) {

  options = options || {};

  const resolve = (file) =>
    file.startsWith(".") ? Path.resolve(file) : file;

  const load = (file, field) => Promise.try(() => resolve(file))
    .then(require).then((pkg) => pkg[field || "dependencies"]);

  return Promise.join(load(pkgFile, options.depField), load(checkFile, options.checkField),
    (component, check) => checkDependencies(component, check, options))
    .then((result) => {
      const failed = () => {
        if (!_.isEmpty(result.unsatisfyCommon)) {
          return true;
        }

        return !options.allowExtra && !_.isEmpty(result.unexpected);
      };

      if (failed()) {
        const error = new Error("component dependencies deviated");
        error.result = result;
        throw error;
      }

      return result;
    });
}

module.exports = {
  checkDependencies,
  checkPkgFile
};
