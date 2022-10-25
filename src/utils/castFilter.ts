import { ADPBaseModel } from "./baseModel.interface";
import escapeStringRegexp from "escape-string-regexp";

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
  const { path } = model.schema;
  Object.keys(obj).forEach((key) => {
    try {
      obj[key] = path(key).cast(obj[key], null, null);
    } catch (e) {}

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

      obj[field] =
        obj[field] && typeof obj[field] == "object" ? obj[field] : {};
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
          obj[field].$in = obj[key];
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
          obj[field].$nin = obj[key];
          break;
      }
      delete obj[key];
    } else if (allowedRegexes.includes(key) && typeof obj[key] === "string") {
      obj[key] = new RegExp(escapeStringRegexp(obj[key]));
    }
  });

  return obj;
}
