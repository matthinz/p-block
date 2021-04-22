import { V } from ".";
import { runNormalizationTests, runValidationTests } from "./test-utils";
import { Path } from "./types";

describe("isBoolean()", () => {
  const tests: [any, boolean, string?, string?, Path?][] = [
    [undefined, false, "invalidType", "input must be of type 'boolean'"],
    [null, false, "invalidType", "input must be of type 'boolean'"],
    [{}, false, "invalidType", "input must be of type 'boolean'"],
    [0, false, "invalidType", "input must be of type 'boolean'"],
    [true, true],
    [false, true],
  ];
  runValidationTests(V.isBoolean(), tests);

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
