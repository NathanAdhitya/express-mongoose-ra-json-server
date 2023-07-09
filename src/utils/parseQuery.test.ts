import parseQuery from "./parseQuery.js";

describe("component: parseQuery", () => {
  test("returns original object if no q", () => {
    const obj = {
      $or: [],
      q: undefined
    };
    const convertedObj = parseQuery(obj, {} as any, []);
    expect(convertedObj).toEqual({
      $or: []
    });
  });

  test("returns original object if no fields", () => {
    const obj = {
      $or: [],
      q: "test"
    };
    const convertedObj = parseQuery(obj, {} as any, []);
    expect(convertedObj).toEqual({
      $or: [],
      q: "test"
    });
  });

  test("returns original object if no $or", () => {
    const obj = {
      $or: undefined,
      q: "test"
    };
    const convertedObj = parseQuery(obj, {} as any, []);
    expect(convertedObj).toEqual({
      $or: undefined,
      q: "test"
    });
  });

  test("returns original object if no $or and no q", () => {
    const obj = {
      $or: undefined,
      q: undefined
    };
    const convertedObj = parseQuery(obj, {} as any, []);
    expect(convertedObj).toEqual({
      $or: undefined
    });
  });

  const mockModel: any = {
    castObject: () => {}
  };

  test("Converts q to $or", () => {
    const obj = {
      $or: [],
      q: "test"
    };
    const convertedObj = parseQuery(obj, mockModel, [], ["test"]);
    expect(convertedObj).toEqual({
      $or: [{ test: "test" }]
    });
  });

  test("Converts q to $or for multiple fields", () => {
    const obj = {
      $or: [],
      q: "test"
    };
    const convertedObj = parseQuery(obj, mockModel, [], ["test", "test2"]);
    expect(convertedObj).toEqual({
      $or: [{ test: "test" }, { test2: "test" }]
    });
  });

  test("Converts q to $or for multiple fields adding contents of original $or", () => {
    const obj = {
      $or: [{ test: "test" }],
      q: "testing123"
    };
    const convertedObj = parseQuery(obj, mockModel, [], ["test", "test2"]);
    expect(convertedObj).toEqual({
      $or: [{ test: "test" }, { test: "testing123" }, { test2: "testing123" }]
    });
  });
});
