import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("integer()", () => {
  describe("stock", () => {
    const parser = P.integer();
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType", "input must be of type 'number'"],
      [null, false, "invalidType", "input must be of type 'number'"],
      ["1234", false, "invalidType", "input must be of type 'number'"],
      [{}, false, "invalidType", "input must be of type 'number'"],
      [[], false, "invalidType", "input must be of type 'number'"],
      [1234, true],
      [1234.01, true, 1234],
      [1234.0, true, 1234],
      [1234.99999999999, true, 1234],
      [Infinity, false, "invalidNumber", "input must be a finite number"],
      [-Infinity, false, "invalidNumber", "input must be a finite number"],
      [NaN, false, "invalidNumber", "input must be a finite number"],
    ];
    runParsingTests(parser, tests);
  });
});

describe("number()", () => {
  describe("stock", () => {
    const parser = P.number();
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
    runParsingTests(parser, tests);
  });

  describe("between()", () => {
    const parser = P.number().between(1, 10);
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
    runParsingTests(parser, tests);
  });

  describe("equalTo()", () => {
    const parser = P.number().equalTo(42);
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
    runParsingTests(parser, tests);
  });

  describe("greaterThan()", () => {
    const parser = P.number().greaterThan(42);
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
    runParsingTests(parser, tests);
  });

  describe("greaterThanOrEqualTo()", () => {
    const parser = P.number().greaterThanOrEqualTo(42);
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
    runParsingTests(parser, tests);
  });

  describe("lessThan()", () => {
    const parser = P.number().lessThan(42);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["abc", false, "invalidType"],
      ["42", false, "invalidType"],
      [41, true],
      [41.999999999999, true],
      [42, false, "lessThan", "input must be less than 42"],
    ];
    runParsingTests(parser, tests);
  });

  describe("lessThanOrEqualTo()", () => {
    const parser = P.number().lessThanOrEqualTo(42);
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
    runParsingTests(parser, tests);
  });

  describe("roundedTo()", () => {
    const parser = P.number().roundedTo(2);
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      ["", false, "invalidType"],
      [NaN, false, "invalidNumber"],
      [Infinity, false, "invalidNumber"],
      [-Infinity, false, "invalidNumber"],
      [2.586, true, 2.59],
    ];
    runParsingTests(parser, tests);
  });

  describe("truncated()", () => {
    const parser = P.number().truncated();
    const tests: ParsingTest<number>[] = [
      [undefined, false, "invalidType"],
      ["", false, "invalidType"],
      [2.586, true, 2],
      [2, true, 2],
    ];
    runParsingTests(parser, tests);
  });
});
