import { V } from ".";
import { runNormalizationTests, runValidationTests } from "./test-utils";
import { Path } from "./types";

describe("isBoolean()", () => {
  describe("validate()", () => {
    const tests: [any, boolean, string?, string?, Path?][] = [
      [undefined, false, "invalidType", "input must be of type 'boolean'"],
      [null, false, "invalidType", "input must be of type 'boolean'"],
      [{}, false, "invalidType", "input must be of type 'boolean'"],
      [0, false, "invalidType", "input must be of type 'boolean'"],
      [true, true],
      [false, true],
    ];
    runValidationTests(V.isBoolean(), tests);
  });

  describe("defaultedTo()", () => {
    const validator = V.isBoolean().defaultedTo(false);

    const tests: [any, any, boolean][] = [
      [undefined, false, true],
      [null, false, true],
      [0, 0, false],
      [1, 1, false],
      [{}, {}, false],
      [[], [], false],
    ];

    runNormalizationTests(validator, tests);
  });

  describe("isFalse()", () => {
    const tests: [any, boolean, string?, string?, Path?][] = [
      [undefined, false, "invalidType"],
      [true, false, "isFalse", "input must be false"],
      [false, true],
    ];
    runValidationTests(V.isBoolean().isFalse(), tests);
  });

  describe("isTrue()", () => {
    const tests: [any, boolean, string?, string?, Path?][] = [
      [undefined, false, "invalidType"],
      [false, false, "isTrue", "input must be true"],
      [true, true],
    ];
    runValidationTests(V.isBoolean().isTrue(), tests);
  });

  describe("normalizedWith()", () => {
    const tests: [any, any, boolean][] = [
      [undefined, false, true],
      [null, false, true],
      [true, true, true],
    ];
    runNormalizationTests(
      V.isBoolean().normalizedWith((input) => !!input),
      tests
    );
  });
});
