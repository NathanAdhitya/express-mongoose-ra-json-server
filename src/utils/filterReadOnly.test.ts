import { filterReadOnly } from "./filterReadOnly.js";

describe("component: filterReadOnly", () => {
  test("filters out readOnly fields", () => {
    const obj = {
      id: 1,
      name: "test",
      readOnly: "test"
    };
    const filteredObj = filterReadOnly(obj, ["readOnly"]);
    expect(filteredObj).toEqual({
      id: 1,
      name: "test"
    });
  });

  test("does not filter out readOnly fields if readOnlyFields is not provided", () => {
    const obj = {
      id: 1,
      name: "test",
      readOnly: "test"
    };
    const filteredObj = filterReadOnly(obj);
    expect(filteredObj).toEqual({
      id: 1,
      name: "test",
      readOnly: "test"
    });
  });
});
