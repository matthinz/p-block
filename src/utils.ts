import {
  Path,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";

export function composeValidators<Type>(
  validators:
    | ValidationFunction<Type>
    | Validator<Type>
    | (ValidationFunction<Type> | Validator<Type>)[],
  defaultErrorCode?: string,
  defaultErrorMessage?: string
): ValidationFunction<Type> {
  return function validate(input: Type): true | ValidationErrorDetails[] {
    const errors = (Array.isArray(validators)
      ? validators
      : [validators]
    ).reduce<ValidationErrorDetails[]>((result, validator) => {
      if (typeof validator === "function") {
        const validationResult = validator(input);
        if (validationResult === false) {
          if (defaultErrorCode === undefined) {
            throw new Error(
              "ValidationFunction return `false`, but not default error code is set"
            );
          }
          result.push({
            code: defaultErrorCode,
            message: defaultErrorMessage ?? defaultErrorCode,
            path: [],
          });
        } else if (validationResult !== true) {
          if (Array.isArray(validationResult)) {
            result.push(...validationResult);
          } else {
            result.push(validationResult);
          }
        }
      } else {
        const parseResult = validator.parse(input);
        if (!parseResult.success) {
          if (parseResult.errors.length === 0) {
            throw new Error("Parsing failed but did not provide any errors.");
          }
          result.push(...parseResult.errors);
        }
      }
      return result;
    }, []);
    return errors.length === 0 || errors;
  };
}

export function pathsEqual(x: Path, y: Path): boolean {
  if (x.length !== y.length) {
    return false;
  }

  if (x.length === 0) {
    return true;
  }
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) {
      return false;
    }
  }

  return true;
}
