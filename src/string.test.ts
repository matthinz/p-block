import { V } from ".";
import { runNormalizationTests, runValidationTests } from "./test-utils";

describe("V.isString()", () => {
  describe("validate()", () => {
    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType", "input must be of type 'string'"],
      [null, false, "invalidType", "input must be of type 'string'"],
      [true, false, "invalidType", "input must be of type 'string'"],
      [false, false, "invalidType", "input must be of type 'string'"],
      ["foo", true],
    ];

    runValidationTests(V.isString(), tests);
  });

  describe("matches", () => {
    const tests: [string, boolean, string?, string?][] = [
      ["foo", true],
      ["bar", false, "matches", "input must match regular expression /foo/"],
    ];

    runValidationTests(V.isString().matches(/foo/), tests);
  });

  describe("maxLength", () => {
    test.todo("must be at least 0");

    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["blah", true],
      ["abcdefghij", true],
      [
        "abcdefghijk",
        false,
        "maxLength",
        "input length must be less than or equal to 10 character(s)",
      ],
    ];

    const validator = V.isString().maxLength(10);

    runValidationTests(validator, tests);
  });

  describe("minLength", () => {
    test.todo("must be at least 0");

    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [
        "",
        false,
        "minLength",
        "input length must be greater than or equal to 10 character(s)",
      ],
      [
        "abcdefghi",
        false,
        "minLength",
        "input length must be greater than or equal to 10 character(s)",
      ],
      ["abcdefghij", true],

      ["abcdefghijk", true],
    ];

    const validator = V.isString().minLength(10);

    runValidationTests(validator, tests);
  });

  describe("notEmpty()", () => {
    const tests: [any, boolean, string?, string?][] = [
      [null, false, "invalidType", "input must be of type 'string'"],
      ["", false, "notEmpty", "input cannot be an empty string"],
      [" ", true],
    ];

    const validator = V.isString().notEmpty();

    runValidationTests(validator, tests);
  });

  describe("passes()", () => {
    const tests: [string, boolean, string?, string?][] = [
      ["valid input", true],
      [
        "invalid input",
        false,
        "not_valid_input",
        "input must be 'valid input'",
      ],
    ];

    const validator = V.isString().passes(
      (s) => s === "valid input",
      "not_valid_input",
      "input must be 'valid input'"
    );

    runValidationTests(validator, tests);
  });

  describe("trimmed()", () => {
    const tests: [string, string, boolean][] = [["  foo ", "foo", true]];
    const normalizer = V.isString().trimmed();

    runNormalizationTests(normalizer, tests);
  });

  describe("lowerCased()", () => {
    const tests: [string, string, boolean][] = [["FOO", "foo", true]];
    const validator = V.isString().lowerCased();

    runNormalizationTests(validator, tests);
  });

  describe("upperCased()", () => {
    const tests: [string, string, boolean][] = [["foo", "FOO", true]];
    const validator = V.isString().upperCased();
    runNormalizationTests(validator, tests);
  });
});
