"use strict";

const check = require("../..");
const _ = require("lodash");
const Path = require("path");

describe("check-dependencies", function () {

  it("should return failed for deviated component dependencies", (done) => {
    check.checkPkgFile("./test/data/component.json", "./test/data/check.json")
      .then(() => {
        throw new Error("expected error");
      })
      .catch((error) => {
        if (error.result) {
          expect(error.result.unsatisfyCommon).to.not.include("@walmart/test");
          const x = _.map(error.result.unsatisfyCommon, (r) => r.name).sort();
          expect(x).to.deep.equal(["any", "caret-0-maj-bad", "not-finite", "tilde-1-bad"]);
          expect(error.result.unexpected).to.be.empty;
        } else {
          throw error;
        }
      })
      .then(() => done())
      .catch(done);
  });


  it("should return failed for unexpected component dependencies", (done) => {
    check.checkPkgFile("./test/data/unexpected.json", "./test/data/check.json")
      .then(() => {
        throw new Error("expected error");
      })
      .catch((error) => {
        if (!error.result) {
          throw error;
        } else {
          const x = error.result.unexpected.map((e) => e.name).sort();
          expect(x).to.deep.equal(["extra"]);
        }
      })
      .then(() => done())
      .catch(done);
  });


  it("should skip extra dependencies check when allowExtra flag is true", (done) => {
    check.checkPkgFile("./test/data/unexpected.json", "./test/data/check.json", {allowExtra: true})
      .then(() => done())
      .catch(done);
  });


  it("should return no error for good component dependencies", (done) => {
    check.checkPkgFile(Path.resolve("test/data/satisfy.json"), "./test/data/check.json")
      .then(() => done())
      .catch(done);
  });

});
