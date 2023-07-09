import convertId from "./convertId.js";

describe("component: convertId", () => {
  test("converts id to _id for simple data", () => {
    const obj = {
      id: 1,
      name: "test"
    };
    const convertedObj = convertId(obj);
    expect(convertedObj).toEqual({
      _id: 1,
      name: "test"
    });
  });

  test("only converts top level id to _id for nested data", () => {
    const obj = {
      id: 1,
      name: "test",
      nested: {
        id: 2,
        name: "nested"
      }
    };
    const convertedObj = convertId(obj);
    expect(convertedObj).toEqual({
      _id: 1,
      name: "test",
      nested: {
        id: 2,
        name: "nested"
      }
    });
  });
});
