import escapeStringRegexp from "escape-string-regexp";
import mongoose from "mongoose";
import { ADPBaseModel } from "./baseModel.interface";
const { ObjectId } = mongoose.Types;

/**
 * Turns all the params into their proper types, string into regexes.
 * Only works with shallow objects.
 * Mutates original object and returns mutated object.
 */
export default function castFilter<T extends ADPBaseModel>(
  obj: Record<string, any>,
  model: T,
  allowedRegexes: string[] = []
) {
  Object.keys(obj).forEach((key) => {
    /**  Parse MongoDB Query Operators **/
    let splittedKey = key.split("_");
    if (
      splittedKey.length > 1 &&
      ["eq", "gt", "gte", "in", "lt", "lte", "ne", "nin"].includes(
        splittedKey[splittedKey.length - 1]
      )
    ) {
      let operator = splittedKey.pop();
      let field = splittedKey.join("_");

      try {
        /** Check if the filter value is valid. **/
        model.castObject({ [field]: obj[key] });
      } catch (error) {
        /** If not valid, ignore the filter **/
        delete obj[key];
        return;
      }

      obj[field] =
        obj[field] && typeof obj[field] == "object" ? obj[field] : {};
      /** Parse operator to mongoDB query operator. **/
      switch (operator) {
        case "eq":
          obj[field].$eq = obj[key];
          break;
        case "gt":
          obj[field].$gt = obj[key];
          break;
        case "gte":
          obj[field].$gte = obj[key];
          break;
        case "in":
          obj[field].$in = Array.isArray(obj[key])
            ? obj[key].map((item) => parsePossibleObjectId(item))
            : [parsePossibleObjectId(obj[key])];
          break;
        case "lt":
          obj[field].$lt = obj[key];
          break;
        case "lte":
          obj[field].$lte = obj[key];
          break;
        case "ne":
          obj[field].$ne = obj[key];
          break;
        case "nin":
          obj[field].$in = Array.isArray(obj[key])
            ? obj[key].map((item) => parsePossibleObjectId(item))
            : [parsePossibleObjectId(obj[key])];
          break;
      }
      delete obj[key];
    } else if (allowedRegexes.includes(key) && typeof obj[key] === "string") {
      obj[key] = new RegExp(escapeStringRegexp(obj[key]));
    } else if (Array.isArray(obj[key])) {
      /** Use $in operator for arrays (getMany)**/
      obj[key] = { $in: obj[key] };
      obj[key].$in.forEach((item, index) => {
        try {
          /** Check if the filter value is valid. **/
          model.castObject({ [key]: item });
        } catch (error) {
          /** If not valid, ignore the filter. **/
          delete obj[key].$in[index];
        }
      });
    } else {
      try {
        /** Check if the filter value is valid. **/
        model.castObject({ [key]: obj[key] });
      } catch (error) {
        /** If not valid, ignore the filter. **/
        delete obj[key];
      }
    }
  });
  return obj;
}

function parsePossibleObjectId(value) {
  if (ObjectId.isValid(value)) {
    let parsedId = new ObjectId(value);
    if (parsedId.toString() === value) {
      return parsedId;
    } else {
      return value;
    }
  } else {
    return value;
  }
}
