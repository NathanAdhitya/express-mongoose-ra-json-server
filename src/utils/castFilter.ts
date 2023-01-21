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

    if (allowedRegexes.includes(key) && typeof obj[key] === "string") {
      obj[key] = new RegExp(escapeStringRegexp(obj[key]), "i");
    }
  });

  return obj;
}
