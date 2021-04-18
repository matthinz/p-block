import { V } from ".";
import { ValidationError } from "./errors";
import { ObjectValidator } from "./object";
import { ValidationErrorDetails, Validator } from "./types";

type PathElement = string | number;
type Path = PathElement[];

describe("isObject()", () => {
  describe("withProperties", () => {
    const validator = V.isObject().withProperties({
      firstName: V.isString(),
      lastName: V.isString(),
    });

    const tests: [
      any,
      boolean,
      (string | string[])?,
      (string | string[])?,
      (Path | Path[])?
    ][] = [
      [undefined, false, "invalidType", "input must be an object", []],
      [null, false, "invalidType", "input must be an object", []],
      [[], false, "invalidType", "input must be an object", []],
      [
        {
          firstName: 123,
          lastName: "bar",
        },
        false,
        "invalidType",
        "input must be of type 'string'",
        ["firstName"],
      ],
      [
        {
          firstName: "foo",
        },
        false,
        "required",
        "input must include property 'lastName'",
        ["lastName"],
      ],
      [
        {},
        false,
        ["required", "required"],
        [
          "input must include property 'firstName'",
          "input must include property 'lastName'",
        ],
        [["firstName"], ["lastName"]],
      ],

      [{ firstName: "foo", lastName: "bar" }, true],
      [
        {
          firstName: "foo",
          lastName: "bar",
          extraProperty: "should be allowed",
        },
        true,
      ],
    ];

    tests.forEach((params) => runValidationTests(validator, ...params));

    describe("throwing", () => {
      tests.forEach((params) =>
        runThrowingTest(validator.shouldThrow(), ...params)
      );
    });
  });

  describe("withProperties (2 levels deep)", () => {
    const validator = V.isObject().withProperties({
      name: V.isString(),
      address: V.isObject().withProperties({
        street: V.isString(),
        city: V.isString(),
        state: V.isString().maxLength(2),
        zip: V.isString().maxLength(5).matches(/\d{5}/),
      }),
    });

    const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
      [
        {},
        false,
        ["required", "required"],
        [
          "input must include property 'name'",
          "input must include property 'address'",
        ],
        [["name"], ["address"]],
      ],
      [
        {
          name: "Test",
          address: {},
        },
        false,
        ["required", "required", "required", "required"],
        [
          "input must include property 'street'",
          "input must include property 'city'",
          "input must include property 'state'",
          "input must include property 'zip'",
        ],
        [["address"], ["address"], ["address"], ["address"]],
      ],
    ];

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
  shouldValidate: boolean,
  errorCode?: string | string[],
  errorMessage?: string | string[],
  errorPath?: Path | Path[]
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
  const desc = `${validator} ${
    shouldValidate ? "validates" : "does not validate"
  } ${inputAsJson}`;

  test(desc, () => {
    try {
      validator.validate(input);
      expect(shouldValidate).toBe(true);
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw err;
      }

      expect(shouldValidate).toBe(false);

      const expectedErrors: ValidationErrorDetails[] = (Array.isArray(errorCode)
        ? errorCode
        : [errorCode]
      ).map((code, index) => {
        if (code === undefined) {
          throw new Error(`No code found at index ${index}`);
        }

        const message = (Array.isArray(errorMessage)
          ? errorMessage
          : [errorMessage])[index];
        if (message === undefined) {
          throw new Error(`No error message found for index ${index}`);
        }

        let path: Path | undefined;

        if (errorPath === undefined) {
          path = [];
        } else if (Array.isArray(errorPath[0])) {
          path = errorPath[index] as Path | undefined;
        } else {
          path = errorPath as Path;
        }

        if (path === undefined) {
          throw new Error(`No error path found for index ${index}`);
        }

        return {
          code,
          message,
          path,
        };
      });

      expect(err.errors).toStrictEqual(expectedErrors);
    }
  });
}
