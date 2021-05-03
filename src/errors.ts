import { ValidationErrorDetails } from "./types";

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
  ...errorLists: ValidationErrorDetails[][]
): ValidationErrorDetails[] {
  const errorsByCode: { [code: string]: ValidationErrorDetails[] } = {};

  return errorLists.reduce((result, list) => {
    list.forEach((err) => {
      const isDuplicate =
        errorsByCode[err.code] &&
        errorsByCode[err.code].find((e) => errorsEqual(err, e));

      if (isDuplicate) {
        return;
      }

      errorsByCode[err.code] = errorsByCode[err.code] ?? [];
      errorsByCode[err.code].push(err);
      result.push(err);
    });
    return result;
  }, []);
}

function errorsEqual(
  x: ValidationErrorDetails,
  y: ValidationErrorDetails
): boolean {
  if (x.code !== y.code) {
    return false;
  }
  if (x.message !== y.message) {
    return false;
  }
  if (x.path.length !== y.path.length) {
    return false;
  }
  for (let i = 0; i < x.path.length; i++) {
    if (x.path[i] !== y.path[i]) {
      return false;
    }
  }
  return true;
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
