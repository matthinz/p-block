import { Normalizer, Path, ValidationErrorDetails, Validator } from "./types";

export function runNormalizationTests<Type>(
  validator:
    | (Validator<Type> & Normalizer)
    | [Validator<Type> & Normalizer, any, any, boolean][],
  tests?: [any, any, boolean][] | undefined
): void {
  const testsWithValidator: [
    Validator<Type> & Normalizer,
    any,
    any,
    boolean
  ][] = Array.isArray(validator)
    ? validator
    : (tests ?? []).map((params) => [validator, ...params]);

  describe("normalize()", () => {
    testsWithValidator.forEach(([validator, input, expected]) => {
      test(`${stringify(input)} normalizes to ${stringify(expected)}`, () => {
        const actual = validator.normalize(input);
        expect(actual).toStrictEqual(expected);
      });
    });

    describe("validate()", () => {
      testsWithValidator.forEach(
        ([validator, input, expected, shouldValidate]) => {
          test(`${stringify(input)} normalizes to ${stringify(expected)} and ${
            shouldValidate ? "validates" : "does not validate"
          }`, () => {
            expect(validator.validate(input)).toBe(shouldValidate);
          });
        }
      );
    });
  });
}

export function runValidationTests<Type>(
  validator: Validator<Type>,
  tests: [
    any,
    boolean,
    (string | string[])?,
    (string | string[])?,
    (Path | Path[])?
  ][]
): void {
  tests.forEach(
    ([input, shouldValidate, errorCodes, errorMessages, errorPaths]) => {
      const desc = `${stringify(input)} ${
        shouldValidate ? "should validate" : "should not validate"
      }`;
      test(desc, () => {
        const parseResult = validator.parse(input);

        if (errorCodes !== undefined) {
          errorCodes = Array.isArray(errorCodes) ? errorCodes : [errorCodes];
          expect(parseResult.errors).toHaveLength(errorCodes.length);
          expect(
            parseResult.errors.map((e: ValidationErrorDetails) => e.code)
          ).toStrictEqual(errorCodes);
        }

        if (errorMessages !== undefined) {
          errorMessages = Array.isArray(errorMessages)
            ? errorMessages
            : [errorMessages];
          expect(parseResult.errors).toHaveLength(errorMessages.length);
          expect(
            parseResult.errors.map((e: ValidationErrorDetails) => e.message)
          ).toStrictEqual(errorMessages);
        }

        if (errorPaths !== undefined) {
          if (!Array.isArray(errorPaths[0])) {
            errorPaths = [errorPaths as Path];
          }
          expect(parseResult.errors).toHaveLength(errorPaths.length);
          expect(
            parseResult.errors.map((e: ValidationErrorDetails) => e.path)
          ).toStrictEqual(errorPaths);
        }

        expect(parseResult).toHaveProperty("success", shouldValidate);
        expect(validator.validate(input)).toBe(parseResult.success);
      });
    }
  );
}

function stringify(value: any): string {
  return JSON.stringify(value, (key, value) => {
    if (value === undefined) {
      return "<<undefined>>";
    }
    if (value === null) {
      return "<<null>>";
    }
    if (value === Infinity) {
      return "<<Infinity>>";
    }
    if (value === -Infinity) {
      return "<<-Infinity>>";
    }
    if (typeof value === "number" && isNaN(value)) {
      return "<<NaN>>";
    }
    return value;
  }).replace(/"<<(.+)>>"/g, "$1");
}
