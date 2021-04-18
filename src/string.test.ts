import { V } from ".";
import { ValidationError } from "./errors";
import { Validator } from "./types";

describe("V.isString()", () => {
  describe("validate()", () => {
    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType", "input must be of type 'string'"],
      [null, false, "invalidType", "input must be of type 'string'"],
      [true, false, "invalidType", "input must be of type 'string'"],
      [false, false, "invalidType", "input must be of type 'string'"],
      ["foo", true],
    ];

    tests.forEach((params) => runValidationTest(V.isString(), ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(V.isString().shouldThrow(), ...params)
      );
    });
  });

  describe("matches", () => {
    const tests: [RegExp, string, boolean, string?, string?][] = [
      [/foo/, "foo", true],
      [
        /foo/,
        "bar",
        false,
        "matches",
        "input must match regular expression /foo/",
      ],
    ];

    tests.forEach(([regex, ...params]) => {
      runValidationTest(V.isString().matches(regex), ...params);
    });

    describe("throwing", () => {
      tests.forEach(([regex, ...params]) =>
        runThrowingTest(V.isString().matches(regex).shouldThrow(), ...params)
      );
    });
  });

  describe("maxLength", () => {
    test.todo("must be at least 0");

    const tests: [number, string, boolean, string?, string?][] = [
      [12, "blah", true],
      [
        3,
        "blah",
        false,
        "maxLength",
        "input length must be less than or equal to 3 character(s)",
      ],
    ];

    tests.forEach(([max, ...params]) =>
      runValidationTest(V.isString().maxLength(max), ...params)
    );

    describe("throwing", () => {
      tests.forEach(([max, ...params]) =>
        runThrowingTest(V.isString().maxLength(max).shouldThrow(), ...params)
      );
    });
  });

  describe("minLength", () => {
    test.todo("must be at least 0");

    const tests: [number, string, boolean, string?, string?][] = [
      [
        12,
        "blah",
        false,
        "minLength",
        "input length must be greater than or equal to 12 character(s)",
      ],
      [3, "blah", true],
    ];

    tests.forEach(([min, ...params]) =>
      runValidationTest(V.isString().minLength(min), ...params)
    );

    describe("throwing", () => {
      tests.forEach(([min, ...params]) =>
        runThrowingTest(V.isString().minLength(min).shouldThrow(), ...params)
      );
    });
  });

  describe("notEmpty()", () => {
    const tests: [any, boolean, string?, string?][] = [
      [null, false, "invalidType", "input must be of type 'string'"],
      ["", false, "notEmpty", "input cannot be an empty string"],
      [" ", true],
    ];

    const validator = V.isString().notEmpty();

    tests.forEach((params) => runValidationTest(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
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

    tests.forEach((params) => runValidationTest(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });

  describe("trimmed()", () => {
    const tests: [string, string, boolean][] = [["  foo ", "foo", true]];
    const v = V.isString().trimmed().maxLength(3);

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });

  describe("lowerCased()", () => {
    const tests: [string, string, boolean][] = [["FOO", "foo", true]];
    const v = V.isString().lowerCased();

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });

  describe("upperCased()", () => {
    const tests: [string, string, boolean][] = [["foo", "FOO", true]];
    const v = V.isString().upperCased();

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });
});

function runValidationTest(
  validator: Validator<string>,
  input: any,
  shouldValidate: boolean,
  errorCode?: string,
  errorMessage?: string
) {
  const desc = input === undefined ? "undefined" : JSON.stringify(input);
  test(`${desc} ${shouldValidate ? "validates" : "does not validate"}`, () => {
    const actual = validator.validate(input);
    expect(actual).toBe(shouldValidate);
  });
}

function runThrowingTest(
  validator: Validator<string>,
  input: any,
  shouldValidate: boolean,
  errorCode?: string,
  errorMessage?: string
) {
  const inputAsJson = input === undefined ? "undefined" : JSON.stringify(input);
  test(`${validator} ${
    shouldValidate ? "validates" : "does not validate"
  } ${inputAsJson}`, () => {
    try {
      validator.validate(input);
      expect(shouldValidate).toBe(true);
    } catch (err) {
      expect(shouldValidate).toBe(false);
      if (err instanceof ValidationError) {
        expect(err.errors).toHaveLength(1);
        expect(err.errors[0]).toHaveProperty("code", errorCode);
        expect(err.errors[0]).toHaveProperty("message", errorMessage);
        expect(err.errors[0]).toHaveProperty("path", []);
      } else {
        throw err;
      }
    }
  });
}
