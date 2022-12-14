# express-mongoose-ra-json-server
[![npm](https://img.shields.io/npm/v/express-mongoose-ra-json-server)](https://www.npmjs.com/package/express-mongoose-ra-json-server)

creates express.js routes from a mongoose model for ra-data-json-server  
Example/demo project is available here: [express-mongoose-ra-json-server-demo](https://github.com/NathanAdhitya/express-mongoose-ra-json-server-demo)

## Installation

`npm add express-mongoose-ra-json-server` or if you use yarn, `yarn add express-mongoose-ra-json-server`

### Client Usage

```ts
import jsonServerProvider from "ra-data-json-server"; // Use ra-data-json-server
const apiUrl = "api/admin"; // Fill this in with your own URL or whatever you wish.
const dataProvider = jsonServerProvider(apiUrl, httpClient);
```

## Usage

Refer to the typescript definitions in [index.ts](src/index.ts) for a more complete information.

### Basic Usage

```ts
import raExpressMongoose from "express-mongoose-ra-json-server";
router.use("/user", raExpressMongoose(userModel));
```

### More Configuration Options

Pass in the options as a second parameter to the function.  
The currently exported typedefs contain just enough comments to describe what they do.

```ts
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

  /** Specify an ACL middleware to check against permissions */
  ACLMiddleware?: (name: string) => RequestHandler;
}
```
