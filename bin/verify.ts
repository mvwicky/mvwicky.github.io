import Ajv, { ValidateFunction } from "ajv";
import chalk from "chalk";
import { promises as fsp } from "fs";
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
  success: chalk.green,
  notice: chalk.blue,
};

const err = (...msg: any[]) => console.error(theme.err(msg));
const success = (...msg: any[]) => console.log(theme.success(msg));
const notice = (...msg: any[]) => console.log(theme.notice(msg));

const root = path.dirname(__dirname);

async function getReadingData(): Promise<object> {
  const dataDir = path.join(root, "_data");
  const dataFile = path.join(dataDir, "reading.yml");
  notice(`Loading data (${dataFile})`);
  const contents = await fsp.readFile(dataFile, { encoding: "utf-8" });
  return yaml.safeLoad(contents, { json: true });
}

function validateData(
  validator: ValidateFunction,
  data: any
): data is ReadingData {
  notice("Running Validation");
  const valid = validator(data);
  return valid as boolean;
}

async function main() {
  const schemaDir = path.join(root, "assets");
  const schemaFile = path.join(schemaDir, "reading-schema.json");
  notice(`Loading schema file (${schemaFile})`);
  const schemaContents = await fsp.readFile(schemaFile, {
    encoding: "utf-8",
  });
  const schemaObj = JSON.parse(schemaContents);
  const ajv = new Ajv();
  notice("Compiling schema.");
  const validate = ajv.compile(schemaObj);
  if (ajv.errors) {
    err("Schema validation errors.");
    err(ajv.errors);
    return;
  }

  const dataObj = await getReadingData();
  if (!validateData(validate, dataObj)) {
    err("Validation Errors.");
    err(validate.errors);
  } else {
    success("Data is valid");
    dataObj.books.forEach((book) => {
      success(` - ${book.title} - ${book.author} (${book.year})`);
    });
  }
  const uptime = process.uptime().toFixed(3);
  notice(`Uptime: ${uptime}`);
}

main();
