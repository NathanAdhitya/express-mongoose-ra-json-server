import { RequestHandler, Router } from "express";
import statusMessages from "./statusMessages.js";
import { ADPBaseModel, ADPBaseSchema } from "./utils/baseModel.interface.js";
import castFilter from "./utils/castFilter.js";
import convertId from "./utils/convertId.js";
import filterGetList from "./utils/filterGetList.js";
import { filterReadOnly } from "./utils/filterReadOnly.js";
import parseQuery from "./utils/parseQuery.js";
import virtualId from "./utils/virtualId.js";

// Export certain helper functions for custom reuse.
export { default as virtualId } from "./utils/virtualId.js";
export { default as convertId } from "./utils/convertId.js";
export { default as castFilter } from "./utils/castFilter.js";
export { default as parseQuery } from "./utils/parseQuery.js";
export { default as filterGetList } from "./utils/filterGetList.js";
export { filterReadOnly } from "./utils/filterReadOnly.js";
export { default as statusMessages } from "./statusMessages.js";

export interface raExpressMongooseCapabilities {
  list?: boolean;
  get?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface raExpressMongooseOptions<T> {
  /** Fields to search from ?q (used for autofill and search) */
  q?: string[];

  /** Base name for ACLs (e.g. list operation does baseName.list) */
  aclName?: string;

  /** Fields to allow regex based search (non-exact search) */
  allowedRegexFields?: string[];

  /** Read-only fields to filter out during create and update */
  readOnlyFields?: string[];

  /** Function to transform inputs received in create and update */
  inputTransformer?: (input: Partial<T>) => Promise<Partial<T>>;

  /** Additional queries for list, e.g. deleted/hidden flag. */
  listQuery?: Record<string, any>;

  /** Max rows from a get operation to prevent accidental server suicide (default 100) */
  maxRows?: number;

  /** Extra selects for mongoose queries (in the case that certain fields are hidden by default) */
  extraSelects?: string;

  /** Disable or enable certain parts. */
  capabilities?: raExpressMongooseCapabilities;

  /** Specify a custom express.js router */
  router?: Router;

  /** Should all queries use lean? (default = true) */
  useLean?: boolean;

  /** Specify an ACL middleware to check against permissions */
  ACLMiddleware?: (name: string) => RequestHandler;
}

export default function raExpressMongoose<T extends ADPBaseModel, I>(
  model: T,
  options?: raExpressMongooseOptions<I>
) {
  const {
    q,
    allowedRegexFields = [],
    readOnlyFields,
    inputTransformer = (input: any) => input,
    listQuery,
    extraSelects,
    maxRows = 100,
    capabilities,
    aclName,
    useLean,
    router = Router(),
    ACLMiddleware
  } = options ?? {};

  const {
    list: canList = true,
    get: canGet = true,
    create: canCreate = true,
    update: canUpdate = true,
    delete: canDelete = true
  } = capabilities ?? {};

  /** getList, getMany, getManyReference */
  if (canList)
    router.get(
      "/",
      aclName && ACLMiddleware
        ? ACLMiddleware(`${aclName}.list`)
        : (req, res, next) => next(),
      async (req, res) => {
        let query = model.find({
          ...listQuery,
          ...parseQuery(
            castFilter(
              convertId(filterGetList(req.query)),
              model,
              allowedRegexFields
            ),
            model,
            allowedRegexFields,
            q
          )
        });

        if (req.query._sort && req.query._order)
          query = query.sort({
            [typeof req.query._sort === "string"
              ? req.query._sort === "id"
                ? "_id"
                : req.query._sort
              : "_id"]: req.query._order === "ASC" ? 1 : -1
          });

        if (req.query._start)
          query = query.skip(
            parseInt(
              typeof req.query._start === "string" ? req.query._start : "0"
            )
          );

        if (req.query._end)
          query = query.limit(
            Math.min(
              parseInt(
                typeof req.query._end === "string" ? req.query._end : "0"
              ) -
                (req.query._start
                  ? parseInt(
                      typeof req.query._start === "string"
                        ? req.query._start
                        : "0"
                    )
                  : 0),
              maxRows
            )
          );
        else query = query.limit(maxRows);

        if (extraSelects) query = query.select(extraSelects);

        res.set(
          "X-Total-Count",
          (
            await model.countDocuments({
              ...listQuery,
              ...parseQuery(
                castFilter(
                  convertId(filterGetList(req.query)),
                  model,
                  allowedRegexFields
                ),
                model,
                allowedRegexFields,
                q
              )
            })
          ).toString()
        );
        if (useLean ?? true) return res.json(virtualId(await query.lean()));

        return res.json(virtualId(await query));
      }
    );

  /** getOne, getMany */
  if (canGet)
    router.get(
      "/:id",
      aclName && ACLMiddleware
        ? ACLMiddleware(`${aclName}.list`)
        : (req, res, next) => next(),
      async (req, res) => {
        let baseQuery = model.findById(req.params.id).select(extraSelects);

        if (useLean ?? true) baseQuery = baseQuery.lean();

        await baseQuery
          .then((result) => res.json(virtualId(result)))
          .catch((e) => {
            return statusMessages.error(res, 400, e);
          });
      }
    );

  /** create */
  if (canCreate)
    router.post(
      "/",
      aclName && ACLMiddleware
        ? ACLMiddleware(`${aclName}.create`)
        : (req, res, next) => next(),
      async (req, res) => {
        // eslint-disable-next-line new-cap
        const result = convertId(
          await inputTransformer(filterReadOnly<I>(req.body, readOnlyFields))
        );
        const newData = {
          ...result
        };

        const newEntry = new model(newData);
        await newEntry
          .save()
          .then((result) => res.json(virtualId(result)))
          .catch((e: any) => {
            return statusMessages.error(res, 400, e, "Bad request");
          });
      }
    );

  /** update */
  if (canUpdate)
    router.put(
      "/:id",
      aclName && ACLMiddleware
        ? ACLMiddleware(`${aclName}.edit`)
        : (req, res, next) => next(),
      async (req, res) => {
        const updateData = {
          ...(await convertId(
            await inputTransformer(filterReadOnly<I>(req.body, readOnlyFields))
          ))
        };

        let baseQuery = model.findOneAndUpdate(
          { _id: req.params.id },
          updateData,
          {
            new: true,
            runValidators: true
          }
        );

        if (useLean ?? true) baseQuery.lean();

        await baseQuery
          .then((result) => res.json(virtualId(result)))
          .catch((e) => {
            return statusMessages.error(res, 400, e, "Bad request");
          });
      }
    );

  /**
   * delete
   */
  if (canDelete)
    router.delete(
      "/:id",
      aclName && ACLMiddleware
        ? ACLMiddleware(`${aclName}.delete`)
        : (req, res, next) => next(),
      async (req, res) => {
        await model
          .findOneAndDelete({ _id: req.params.id })
          .then((result) => res.json(virtualId(result)))
          .catch((e) => {
            return statusMessages.error(res, 404, e, "Element does not exist");
          });
      }
    );

  return router;
}
