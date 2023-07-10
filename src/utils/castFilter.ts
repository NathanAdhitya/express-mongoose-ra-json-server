import escapeStringRegexp from "escape-string-regexp";
import { ADPBaseModel } from "./baseModel.interface.js";

/**
 * Turns all the params into their proper types, string into regexes.
 * Only works with shallow objects.
 * Mutates original object and returns mutated object.
 */
export default function castFilter<T extends ADPBaseModel>(
  obj: Record<string, any>,
  model: T,
  allowedRegexes: string[] = [],
  regexFlags: string = "i"
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
        let casted = null;

        // if operator is in and nin, and the value is an array, cast each element of the array
        if (
          (operator == "in" || operator == "nin") &&
          Array.isArray(obj[key])
        ) {
          casted = {
            [field]: obj[key].map(
              (item: any) => model.castObject({ [field]: item })[field]
            )
          };
        } else {
          casted = model.castObject({ [field]: obj[key] });
        }

        // Replace the value with the casted value
        obj[key] = casted[field];
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
          obj[field].$in = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
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
          obj[field].$in = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
          break;
      }
      delete obj[key];
    } else if (allowedRegexes.includes(key) && typeof obj[key] === "string") {
      obj[key] = new RegExp(escapeStringRegexp(obj[key]), regexFlags);
    } else if (Array.isArray(obj[key])) {
      /** Use $in operator for arrays (getMany)**/
      obj[key] = { $in: obj[key] };
      obj[key].$in.forEach((item, index) => {
        try {
          /** Check if the filter value is valid. **/
          const casted = model.castObject({ [key]: item })[key];
          obj[key].$in[index] = casted;
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
