import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isBoolean()", () => {
  describe("validate()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType", "input must be of type 'boolean'"],
      [null, false, "invalidType", "input must be of type 'boolean'"],
      [{}, false, "invalidType", "input must be of type 'boolean'"],
      [0, false, "invalidType", "input must be of type 'boolean'"],
      [true, true],
      [false, true],
    ];
    runParsingTests(V.isBoolean(), tests);
  });

  describe("defaultedTo()", () => {
    const validator = V.isBoolean().defaultedTo(false);

    const tests: ParsingTest<boolean>[] = [
      [undefined, true, false],
      [null, true, false],
      [0, false, "invalidType"],
      [1, false, "invalidType"],
      [{}, false, "invalidType"],
      [[], false, "invalidType"],
    ];

    runParsingTests(validator, tests);
  });

  describe("isFalse()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [true, false, "isFalse", "input must be false"],
      [false, true],
    ];
    runParsingTests(V.isBoolean().isFalse(), tests);
  });

  describe("isTrue()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [false, false, "isTrue", "input must be true"],
      [true, true],
    ];
    runParsingTests(V.isBoolean().isTrue(), tests);
  });

  describe("normalizedWith()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [false, true, true],
      [true, true, false],
    ];
    runParsingTests(
      V.isBoolean().normalizedWith((input) => !input),
      tests
    );
  });
});
