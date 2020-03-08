import Ajv from "ajv";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import yaml from "js-yaml";

interface Book {
  title: string;
  author: string;
  year: number;
  comments?: string;
  started?: string;
  finished?: string;
  pages?: number;
}

interface ReadingData {
  books: Book[];
}

const theme = {
  err: chalk.redBright,
  success: chalk.green
};

const err = console.error;
const log = console.log;

const root = path.dirname(path.dirname(__filename));

function getReadingData() {
  const dataDir = path.join(root, "_data");
  const dataFile = path.join(dataDir, "reading.yml");
  const contents = fs.readFileSync(dataFile, "utf-8");
  return yaml.safeLoad(contents, { json: true });
}

function validateData(
  validator: Ajv.ValidateFunction,
  data: any
): data is ReadingData {
  const valid = validator(data);
  if (!valid) {
  } else {
  }
  return valid as boolean;
}

function main() {
  const schemaDir = path.join(root, "assets");
  const schemaFile = path.join(schemaDir, "reading-schema.json");
  const schemaObj = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));
  const ajv = new Ajv();
  const validate = ajv.compile(schemaObj);
  if (ajv.errors) {
    err(theme.err("Schema validation errors."));
    err(ajv.errors);
    return;
  }

  const dataObj = getReadingData();
  if (!validateData(validate, dataObj)) {
    err(theme.err("Validation Errors."));
    err(validate.errors);
  } else {
    log(theme.success("Data is valid"));
  }
  // log(dataObj.books);
}

main();
