import { ValidationErrorDetails } from "./types";
import { pathsEqual } from "./utils";

export class ValidationError extends Error {
  readonly errors: ValidationErrorDetails[];

  constructor(errors: ValidationErrorDetails[]) {
    super(`Validation failed: ${summarizeErrors(errors)}`);

    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }
}
export function combineErrorLists(
  errorLists: ValidationErrorDetails[][],
  merger: (
    x: ValidationErrorDetails,
    y: ValidationErrorDetails
  ) => ValidationErrorDetails | ValidationErrorDetails[]
): ValidationErrorDetails[] {
  return errorLists.reduce(reducer, []);

  function reducer(
    result: ValidationErrorDetails[],
    errors: ValidationErrorDetails[]
  ): ValidationErrorDetails[] {
    errors.forEach((err) => {
      const index = result.findIndex(
        (e) => e.code === err.code && pathsEqual(e.path, err.path)
      );
      if (index < 0) {
        result.push(err);
        return result;
      }

      const merged = merger(result[index], err);

      if (Array.isArray(merged)) {
        result.splice(index, 1, ...merged);
      } else {
        result[index] = merged;
      }
    });

    return result;
  }
}

export function resolveErrorDetails(
  defaultErrorCode: string,
  defaultErrorMessage: string,
  providedErrorCode?: string,
  providedErrorMessage?: string
): [string, string] {
  if (providedErrorCode === undefined) {
    return [defaultErrorCode, defaultErrorMessage];
  }
  return [providedErrorCode, providedErrorMessage ?? providedErrorCode];
}

function summarizeErrors(errors: ValidationErrorDetails[]): string {
  return errors
    .map(({ code, message, path }) => {
      if (path.length > 0) {
        return `${path}: ${code} (${message})`;
      }

      return `${code} (${message})`;
    })
    .join(", ");
}
