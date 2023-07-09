import virtualId from "./virtualId.js";

describe("component: virtualId", () => {
  test("converts _id to id for simple data", () => {
    const obj = {
      _id: "1",
      name: "test"
    };
    const convertedObj = virtualId(obj);
    expect(convertedObj).toEqual({
      id: "1",
      name: "test"
    });
  });

  test("only converts top level _id to id for nested data", () => {
    const obj = {
      _id: "1",
      name: "test",
      nested: {
        _id: "2",
        name: "nested"
      }
    };
    const convertedObj = virtualId(obj);
    expect(convertedObj).toEqual({
      id: "1",
      name: "test",
      nested: {
        _id: "2",
        name: "nested"
      }
    });
  });

  test("converts _id to id for array of data", () => {
    const obj = [
      {
        _id: "1",
        name: "test"
      },
      {
        _id: "2",
        name: "test2"
      }
    ];
    const convertedObj = virtualId(obj);
    expect(convertedObj).toEqual([
      {
        id: "1",
        name: "test"
      },
      {
        id: "2",
        name: "test2"
      }
    ]);
  });
});
