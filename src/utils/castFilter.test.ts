import mongoose, { Types } from "mongoose";
import castFilter from "./castFilter.js";

/* Create a new schema for testing all features of castFilter. */
const testSchema = new mongoose.Schema({
  string: String,
  number: Number,
  date: Date,

  strings: [String],
  numbers: [Number],
  dates: [Date],
  objectIds: [mongoose.Schema.Types.ObjectId]
});

const testModel = mongoose.model("test", testSchema);

describe("component: castFilter", () => {
  // Must test _eq, _gte, _lte, _gt, _lt, _in
  // Must also test nested objects
  // Also test with regex

  describe("no operator", () => {
    test("string", async () => {
      const result = castFilter({ string: "stringa" }, testModel);
      expect(result).toEqual({ string: "stringa" });
    });
  });

  describe("single level", () => {
    describe("operator: _eq", () => {
      test("string", async () => {
        const result = castFilter({ string_eq: "stringa" }, testModel);
        expect(result).toEqual({ string: { $eq: "stringa" } });
      });

      test("string -> number", async () => {
        const result = castFilter({ number_eq: "1" }, testModel);
        expect(result).toEqual({ number: { $eq: 1 } });
      });

      test("string -> date", async () => {
        const result = castFilter({ date_eq: "2020-01-01" }, testModel);
        expect(result).toEqual({
          date: { $eq: new Date("2020-01-01") }
        });
      });

      test("string -> objectId", async () => {
        const result = castFilter(
          { _id_eq: "5f1c0d1b7e4c5b0e9c4d8e1d" },
          testModel
        );
        expect(result).toEqual({
          _id: {
            $eq: new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1d")
          }
        });
      });
    });

    // _gte, _lte, _gt, _lt must be tested with number, date
    const comparisonOperatorTestCandidates = ["_gte", "_lte", "_gt", "_lt"];

    comparisonOperatorTestCandidates.forEach((candidate) => {
      describe(`operator: ${candidate} -> number`, () => {
        test("string", async () => {
          const result = castFilter({ [`number${candidate}`]: "1" }, testModel);
          expect(result).toEqual({
            number: { [`$${candidate.substring(1)}`]: 1 }
          });
        });

        test("number", async () => {
          const result = castFilter({ [`number${candidate}`]: 100 }, testModel);
          expect(result).toEqual({
            number: { [`$${candidate.substring(1)}`]: 100 }
          });
        });
      });

      describe(`operator: ${candidate} -> date`, () => {
        test("string", async () => {
          const result = castFilter(
            { [`date${candidate}`]: "2020-01-01" },
            testModel
          );
          expect(result).toEqual({
            date: {
              [`$${candidate.substring(1)}`]: new Date("2020-01-01")
            }
          });
        });

        test("date", async () => {
          const result = castFilter(
            { [`date${candidate}`]: "2020-01-01" },
            testModel
          );
          expect(result).toEqual({
            date: {
              [`$${candidate.substring(1)}`]: new Date("2020-01-01")
            }
          });
        });
      });
    });

    // Test _in, _nin with single string, number, date, objectId
    describe("single value, operator: _in", () => {
      test("string", async () => {
        const result = castFilter({ string_in: "a" }, testModel);
        expect(result).toEqual({ string: { $in: ["a"] } });
      });

      test("number", async () => {
        const result = castFilter({ number_in: 1 }, testModel);
        expect(result).toEqual({ number: { $in: [1] } });
      });

      test("string -> date", async () => {
        const result = castFilter({ date_in: "2020-01-01" }, testModel);
        expect(result).toEqual({
          date: {
            $in: [new Date("2020-01-01")]
          }
        });
      });

      test("string -> objectId", async () => {
        const result = castFilter(
          {
            _id_in: "5f1c0d1b7e4c5b0e9c4d8e1d"
          },
          testModel
        );
        expect(result).toEqual({
          _id: {
            $in: [new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1d")]
          }
        });
      });
    });

    describe("multiple values, operator: _in", () => {
      test("string", async () => {
        const result = castFilter({ string_in: ["a", "b"] }, testModel);
        expect(result).toEqual({ string: { $in: ["a", "b"] } });
      });

      test("number", async () => {
        const result = castFilter({ number_in: [1, 2] }, testModel);
        expect(result).toEqual({ number: { $in: [1, 2] } });
      });

      test("string -> date", async () => {
        const result = castFilter(
          { date_in: ["2020-01-01", "2020-01-02"] },
          testModel
        );
        expect(result).toEqual({
          date: {
            $in: [new Date("2020-01-01"), new Date("2020-01-02")]
          }
        });
      });

      test("string -> objectId", async () => {
        const result = castFilter(
          {
            _id_in: ["5f1c0d1b7e4c5b0e9c4d8e1d", "5f1c0d1b7e4c5b0e9c4d8e1e"]
          },
          testModel
        );
        expect(result).toEqual({
          _id: {
            $in: [
              new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1d"),
              new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1e")
            ]
          }
        });
      });
    });
  });

  // Test direct arrays
  describe("direct arrays", () => {
    test("string", async () => {
      const result = castFilter({ string: ["a", "b"] }, testModel);
      expect(result).toEqual({ string: { $in: ["a", "b"] } });
    });

    test("number", async () => {
      const result = castFilter({ number: [1, 2] }, testModel);
      expect(result).toEqual({ number: { $in: [1, 2] } });
    });

    test("string -> date", async () => {
      const result = castFilter(
        { date: ["2020-01-01", "2020-01-02"] },
        testModel
      );
      expect(result).toEqual({
        date: {
          $in: [new Date("2020-01-01"), new Date("2020-01-02")]
        }
      });
    });

    test("string -> objectId", async () => {
      const result = castFilter(
        {
          _id: ["5f1c0d1b7e4c5b0e9c4d8e1d", "5f1c0d1b7e4c5b0e9c4d8e1e"]
        },
        testModel
      );
      expect(result).toEqual({
        _id: {
          $in: [
            new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1d"),
            new Types.ObjectId("5f1c0d1b7e4c5b0e9c4d8e1e")
          ]
        }
      });
    });
  });

  // Test Regex
  describe("regex", () => {
    test("regex defaults to case-insensitive", async () => {
      const result = castFilter({ string: "a" }, testModel, ["string"]);
      expect(result).toEqual({ string: /a/i });
    });

    test("may specify regex flags", async () => {
      const result = castFilter({ string: "a" }, testModel, ["string"], "g");
      expect(result).toEqual({ string: /a/g });
    });

    test("may empty regex flags", async () => {
      const result = castFilter({ string: "a" }, testModel, ["string"], "");
      expect(result).toEqual({ string: /a/ });
    });
  });
});
