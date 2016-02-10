#!/usr/bin/env node
"use strict";

const fs = require("fs");
const Optimist = require("optimist");
const CheckDep = require("..");
const Path = require("path");
const _ = require("lodash");

const args = Optimist.options("filename", {
    default: "package.json",
    alias: "f"
  })
  .describe("filename", "component package.json to verify")
  .options("checkFile", {
    default: "",
    alias: "cf"
  })
  .describe("checkFile", "check list json file to verify against")
  .options("allowExtra", {
    default: false,
    alias: "ae"
  })
  .describe("allowExtra", "allow extra dependencies not in check list")
  .options("help", {
    default: false,
    alias: "h"
  })
  .options("warn", {
    default: false,
    alias: "w"
  })
  .describe("warn", "show warning but exit with status OK")
  .describe("help", "help")
  .alias("help", "?");

const options = args.argv;

if (options.help) {
  args.showHelp();
  process.exit(0);
}

function resolveFile(file) {
  try {
    require(file);
    return file;
  } catch (e) {
    file = Path.resolve(file);
    if (fs.existsSync(file)) {
      return file;
    }
  }
}

const filename = resolveFile(options.filename);
if (!filename) {
  console.error(`File does not exist: ${options.filename}`);
  process.exit(1);
}

const checkFile = resolveFile(options.checkFile);
if (!checkFile) {
  console.error(`Check file does not exist: ${options.checkFile}`);
  process.exit(1);
}

CheckDep
  .checkPkgFile(filename, checkFile, {allowExtra: options.allowExtra})
  .then(() => {
    console.log("Check dependencies passed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Check dependencies failed.");
    const result = error.result;
    if (!result) {
      console.error("No result.")
    } else {
      if (!_.isEmpty(result.unsatisfyCommon)) {
        console.error("These dependencies are using versions that are not expected:");
        _.each(result.unsatisfyCommon, (x) => {
          console.error(`    - ${x.name}: version: "${x.want}" expected: "${x.expected}"`);
        });
      }

      if (!_.isEmpty(result.unexpected)) {
        console.error("These dependencies are not expected:");
        _.each(result.unexpected, (x) => {
          console.error(`    - ${x.name}: version: "${x.version}"`);
        })
      }
    }
    process.exit(options.warn ? 0 : 1);
  });
