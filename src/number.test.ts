import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isNumber()", () => {
  describe("stock", () => {
    const validator = V.isNumber();
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType", "input must be of type 'number'"],
      [null, false, "invalidType", "input must be of type 'number'"],
      ["1234", false, "invalidType", "input must be of type 'number'"],
      [{}, false, "invalidType", "input must be of type 'number'"],
      [[], false, "invalidType", "input must be of type 'number'"],
      [1234, true],
      [Infinity, false, "invalidNumber", "input must be a finite number"],
      [-Infinity, false, "invalidNumber", "input must be a finite number"],
      [NaN, false, "invalidNumber", "input must be a finite number"],
    ];
    runParsingTests(validator, tests);
  });

  describe("between()", () => {
    const validator = V.isNumber().between(1, 10);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [0, false, "between", "input must be between 1 and 10 (inclusive)"],
      [11, false, "between", "input must be between 1 and 10 (inclusive)"],
      [1, true],
      [10, true],
    ];
    runParsingTests(validator, tests);
  });

  describe("equalTo()", () => {
    const validator = V.isNumber().equalTo(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [41, false, "equalTo", "input must be equal to 42"],
      [43, false, "equalTo", "input must be equal to 42"],
      [42, true],
      [42.0, true],
    ];
    runParsingTests(validator, tests);
  });

  describe("greaterThan()", () => {
    const validator = V.isNumber().greaterThan(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [41, false, "greaterThan", "input must be greater than 42"],
      [42, false, "greaterThan", "input must be greater than 42"],
      [42.0001, true],
      [43, true],
    ];
    runParsingTests(validator, tests);
  });

  describe("greaterThanOrEqualTo()", () => {
    const validator = V.isNumber().greaterThanOrEqualTo(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [
        41,
        false,
        "greaterThanOrEqualTo",
        "input must be greater than or equal to 42",
      ],
      [42, true],
      [42.0001, true],
      [43, true],
    ];
    runParsingTests(validator, tests);
  });

  describe("lessThan()", () => {
    const validator = V.isNumber().lessThan(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [41, true],
      [41.999999999999, true],
      [42, false, "lessThan", "input must be less than 42"],
    ];
    runParsingTests(validator, tests);
  });

  describe("lessThanOrEqualTo()", () => {
    const validator = V.isNumber().lessThanOrEqualTo(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [41, true],
      [42, true],
      [41.999999999999, true],
      [
        42.0001,
        false,
        "lessThanOrEqualTo",
        "input must be less than or equal to 42",
      ],
    ];
    runParsingTests(validator, tests);
  });

  describe("roundedTo()", () => {
    const validator = V.isNumber().roundedTo(2);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      ["", false, "invalidType"],
      [NaN, false, "invalidNumber"],
      [Infinity, false, "invalidNumber"],
      [-Infinity, false, "invalidNumber"],
      [2.586, true, 2.59],
    ];
    runParsingTests(validator, tests);
  });

  describe("truncated()", () => {
    const validator = V.isNumber().truncated();
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      ["", false, "invalidType"],
      [2.586, true, 2],
      [2, true, 2],
    ];
    runParsingTests(validator, tests);
  });
});
