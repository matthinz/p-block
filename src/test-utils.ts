import { ValidationError } from "./errors";
import { Normalizer, Path, Validator } from "./types";

type TestableValidator<Type> = Validator<Type> & {
  shouldThrow?: () => TestableValidator<Type>;
};

export function runNormalizationTests<Type>(
  validator: Validator<Type> & Normalizer,
  tests: [Type, Type, boolean][]
) {
  tests.forEach(([input, expected, shouldValidate]) => {
    describe(`"${stringify(input)}" -> "${stringify(expected)}"`, () => {
      test("normalize()", () => {
        const actual = validator.normalize(input);
        expect(actual).toBe(expected);
      });
      test("validate()", () => {
        expect(validator.validate(input)).toBe(shouldValidate);
      });
    });
  });
}

export function runValidationTests<Type>(
  validator: TestableValidator<Type>,
  tests: [
    any,
    boolean,
    (string | string[])?,
    (string | string[])?,
    (Path | Path[])?
  ][]
) {
  tests.forEach(
    ([input, shouldValidate, errorCodes, errorMessages, errorPaths]) => {
      const desc = `${stringify(input)} ${
        shouldValidate ? "should validate" : "should not validate"
      }`;
      test(desc, () => {});
    }
  );

  if (!validator.shouldThrow) {
    return;
  }

  const throwingValidator = validator.shouldThrow();

  describe("throwing", () => {
    tests.forEach(
      ([input, shouldValidate, errorCodes, errorMessages, errorPaths]) => {
        const desc = `${stringify(input)} ${
          shouldValidate ? "should not throw" : "should throw"
        }`;
        test(desc, () => {
          try {
            throwingValidator.validate(input);
            expect(shouldValidate).toBe(true);
          } catch (err) {
            if (!(err instanceof ValidationError)) {
              throw err;
            }

            if (errorCodes !== undefined) {
              errorCodes = Array.isArray(errorCodes)
                ? errorCodes
                : [errorCodes];
              expect(err.errors).toHaveLength(errorCodes.length);
              expect(err.errors.map(({ code }) => code)).toStrictEqual(
                errorCodes
              );
            }

            if (errorMessages !== undefined) {
              errorMessages = Array.isArray(errorMessages)
                ? errorMessages
                : [errorMessages];
              expect(err.errors).toHaveLength(errorMessages.length);
              expect(err.errors.map(({ message }) => message)).toStrictEqual(
                errorMessages
              );
            }

            if (errorPaths !== undefined) {
              if (!Array.isArray(errorPaths[0])) {
                errorPaths = [errorPaths as Path];
              }
              expect(err.errors).toHaveLength(errorPaths.length);
              expect(err.errors.map(({ path }) => path)).toStrictEqual(
                errorPaths
              );
            }
          }
        });
      }
    );
  });
}

function stringify(value: any): string {
  return JSON.stringify(value, (key, value) => {
    if (value === undefined) {
      return "undefined";
    }
    return value;
  });
}
