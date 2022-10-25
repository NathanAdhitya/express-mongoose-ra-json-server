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
## Query Operators

MongoDB Query Operators can be used by appending them as a suffix to the field name ([see here](https://marmelab.com/react-admin/FilteringTutorial.html#filter-operators)).
### Supported Operators
| MongoDB Query Operator | Field Suffix | Description                                                                                                                                                                     |
|------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| $eq                    | _eq          | Matches values that are equal to a specified value. <br/> (Usefull for matching exact values if a field is included in allowedRegexFields) <br/> Example:  `/user?name_eq=Alex` |
| $gt                    | _gt          | Matches values that are greater than a specified value. <br/> Example:  `/user?createdAt_gt=2022-10-25T00%3A00%3A00.000Z`                                                       |
| $gte                   | _gte         | Matches values that are greater than or equal to a specified value. <br/> Example:  `/user?createdAt_gte=2022-10-25T00%3A00%3A00.000Z`                                          |
| $in                    | _in          | Matches any of the values specified in an array. <br/> Example: `/user?name_in=Alex&name_in=Peter`                                                                              |
| $lt                    | _lt          | Matches values that are less than a specified value. <br/> Example:  `/user?createdAt_lt=2022-10-25T00%3A00%3A00.000Z`                                                          |
| $lte                   | _lte         | Matches values that are less than or equal to a specified value. <br/> Example:  `/user?createdAt_lte=2022-10-25T00%3A00%3A00.000Z`                                             |
| $ne                    | _ne          | Matches all values that are not equal to a specified value. <br/> Example:  `/user?name_ne=Alex`                                                                                |
| $nin                   | _nin         | Matches none of the values specified in an array. <br/> Example:  `/user?name_nin=Alex&name_nin=Peter`                                                                          |

### Example Filter in React Admin
```js
import { Datagrid, DateField, DateTimeInput, List, TextField } from 'react-admin';

const userFilter = [
    <DateTimeInput source="createdAt_gte" alwaysOn />,
];

export const UserList = () => (
    <List filters={userFilter}>
        <Datagrid>
            <TextField source="name" label="Name" />
            <DateField source="createdAt" showTime />
        </Datagrid>
    </List>
);
```
