import { ADPBaseModel } from "./baseModel.interface.js";
import castFilter from "./castFilter.js";

interface parseQueryParam {
  q?: string;
  $or?: any;
}

/**
 * Turns ?q into $or queries, deletes q
 * @param {T} result Original object with the q field and $or field
 * @param {M} model Model to cast the query to
 * @param {string[]} allowedRegexes Allowed regexes for the model
 * @param {string[]} fields Fields to apply q to
 */
export default function parseQuery<
  T extends parseQueryParam,
  M extends ADPBaseModel
>(
  result: T,
  model: M,
  allowedRegexes: string[],
  fields?: string[]
): T & { $or?: any } {
  if (!fields) return result;
  if (result.q) {
    if (!Array.isArray(result.$or)) result.$or = [];
    fields.forEach((field) => {
      const newFilter = { [field]: result.q };
      result.$or.push(castFilter(newFilter, model, allowedRegexes));
    });
    delete result.q;
  }
  return result;
}
