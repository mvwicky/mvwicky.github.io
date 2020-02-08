import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";
import yaml from "js-yaml";

const root = path.dirname(path.dirname(__filename));
const dataDir = path.join(root, "_data");
const dataFile = path.join(dataDir, "reading.yml");
const dataObj = yaml.safeLoad(fs.readFileSync(dataFile, "utf-8"));
const schemaDir = path.join(root, "assets");
const schemaFile = path.join(schemaDir, "reading-schema.json");
const schemaObj = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));

const ajv = new Ajv();
const validate = ajv.compile(schemaObj);
const valid = validate(dataObj);
if (!valid) {
  console.log(validate.errors);
} else {
  console.log("Data is valid");
  console.log(dataObj.books);
}
