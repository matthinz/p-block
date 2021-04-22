import { V } from ".";
import { ValidationError } from "./errors";
import { Path, Validator } from "./types";

describe("isArray()", () => {
  const tests: [any, boolean, string?, string?][] = [
    [undefined, false, "invalidType", "input must be an array"],
    [null, false, "invalidType", "input must be an array"],
    [{}, false, "invalidType", "input must be an array"],
    [{ length: 1, "1": "foo" }, false, "invalidType", "input must be an array"],
    [[], true],
    [["foo", true, 1234, null, undefined], true],
  ];

  tests.forEach((params) => runValidationTests(V.isArray(), ...params));

  describe("throwing", () => {
    tests.forEach((params) =>
      runThrowingTest(V.isArray().shouldThrow(), ...params)
    );
  });

  describe("allItemsPass", () => {
    describe("errorCode specified", () => {
      const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
        [undefined, false, ["invalidType"], ["input must be an array"]],
        [[], true],
        [[1, 2, -3], false, ["must_be_positive"], ["must be positive"], [[2]]],
        [[1, 2, 3], true],
      ];

      const validator = V.isArray()
        .of(V.isNumber())
        .allItemsPass(
          (value) => value > 0,
          "must_be_positive",
          "must be positive"
        );

      tests.forEach((params) => runValidationTests(validator, ...params));

      describe("throwing", () => {
        tests.forEach((params) =>
          runThrowingTest(validator.shouldThrow(), ...params)
        );
      });
    });
    describe("errorCode not specified", () => {
      const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
        [undefined, false, ["invalidType"], ["input must be an array"]],
        [[], true],
        [
          [1, 2, -3],
          false,
          ["allItemsPass"],
          ["all items in input array must pass the check"],
          [[2]],
        ],
        [[1, 2, 3], true],
      ];

      const validator = V.isArray()
        .of(V.isNumber())
        .allItemsPass((value) => value > 0);

      tests.forEach((params) => runValidationTests(validator, ...params));

      describe("throwing", () => {
        tests.forEach((params) =>
          runThrowingTest(validator.shouldThrow(), ...params)
        );
      });
    });
  });

  describe("maxLength", () => {
    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType", "input must be an array"],
      [[], true],
      [["foo"], true],
      [["foo", "bar"], true],
      [
        ["foo", "bar", "baz"],
        false,
        "maxLength",
        "input must be an array of no more than 2 item(s)",
      ],
    ];
    const validator = V.isArray().maxLength(2);
    tests.forEach((params) => runValidationTests(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });

  describe("minLength", () => {
    const tests: [any, boolean, string?, string?][] = [
      [undefined, false, "invalidType", "input must be an array"],
      [[], false, "minLength", "input must be an array of at least 2 item(s)"],
      [
        ["foo"],
        false,
        "minLength",
        "input must be an array of at least 2 item(s)",
      ],
      [["foo", "bar"], true],
      [["foo", "bar", "baz"], true],
    ];
    const validator = V.isArray().minLength(2);
    tests.forEach((params) => runValidationTests(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });

  describe("normalizedWith", () => {
    const validator = V.isArray()
      .of(V.isString())
      .normalizedWith((values: string[]) =>
        values.map((value) => value.toUpperCase())
      );

    const input = ["foo", "Bar"];

    test("normalize()", () => {
      expect(validator.normalize(input)).toStrictEqual(["FOO", "BAR"]);
    });

    test("passes normalized input to next validator", () => {
      expect(
        validator
          .allItemsPass((item) => item === item.toUpperCase())
          .validate(input)
      ).toBe(true);
    });
  });

  describe("of()", () => {
    const tests: [any, boolean, string?, string?, Path?][] = [
      [[], true],
      [[123], false, "invalidType", "input must be of type 'string'", [0]],
      [
        ["foo", 123],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", null],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", undefined],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", new Date()],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", {}],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [["foo", "bar"], true],
    ];
    const validator = V.isArray().of(V.isString());

    tests.forEach((params) => runValidationTests(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });

  describe("passes", () => {
    function allPositive(input: number[]): boolean {
      return input.every((item) => item > 0);
    }

    const tests: [any, boolean, string?, string?, Path?][] = [
      [[], true],
      [null, false, "invalidType", "input must be an array", []],
      [undefined, false, "invalidType", "input must be an array", []],
      ["", false, "invalidType", "input must be an array", []],
      [[1, 2, -1], false, "not_positive", "should be positive", []],
      [[1, 2, 3], true],
    ];

    const validator = V.isArray()
      .of(V.isNumber())
      .passes(allPositive, "not_positive", "should be positive");

    tests.forEach((params) => runValidationTests(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });
});

function runValidationTests(
  validator: Validator<any>,
  input: any,
  shouldValidate: boolean
) {
  const inputAsJson = input === undefined ? "undefined" : JSON.stringify(input);
  const desc = `${validator} ${
    shouldValidate ? "validates" : "does not validate"
  } ${inputAsJson}`;

  test(desc, () => {
    expect(validator.validate(input)).toBe(shouldValidate);
  });
}

function runThrowingTest(
  validator: Validator<any>,
  input: any,
  shouldValidate: boolean,
  errorCode?: string | string[],
  errorMessage?: string | string[],
  errorPath?: Path | Path[]
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
        if (errorCode !== undefined) {
          errorCode = Array.isArray(errorCode) ? errorCode : [errorCode];
          expect(err.errors).toHaveLength(errorCode.length);
          expect(err.errors.map(({ code }) => code)).toStrictEqual(errorCode);
        }

        if (errorMessage !== undefined) {
          errorMessage = Array.isArray(errorMessage)
            ? errorMessage
            : [errorMessage];
          expect(err.errors).toHaveLength(errorMessage.length);
          expect(err.errors.map(({ message }) => message)).toStrictEqual(
            errorMessage
          );
        }

        if (errorPath !== undefined) {
          if (!Array.isArray(errorPath[0])) {
            errorPath = [errorPath as Path];
          }
          expect(err.errors).toHaveLength(errorPath.length);
          expect(err.errors.map(({ path }) => path)).toStrictEqual(errorPath);
        }
      } else {
        throw err;
      }
    }
  });
}
