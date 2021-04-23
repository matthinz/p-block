import {
  ValidationContext,
  ValidationErrorDetails,
  ValidatorOptions,
} from "./types";

export class ValidationError extends Error {
  readonly errors: ValidationErrorDetails[];

  constructor(errors: ValidationErrorDetails[]) {
    super(`Validation failed: ${summarizeErrors(errors)}`);

    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }
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

/**
 * Alters `options` such that any validators using it will
 * throw errors on validation failure.
 */
export function enableThrowing(options: ValidatorOptions): ValidatorOptions {
  return {
    ...options,
    prepareContext(context?: ValidationContext): ValidationContext {
      return {
        ...(context ?? { path: [] }),
        handleErrors(errors: ValidationErrorDetails[]): false {
          throw new ValidationError(errors);
        },
      };
    },
  };
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

export function setErrorOptions(
  options: ValidatorOptions,
  errorCode?: string,
  errorMessage?: string
): ValidatorOptions {
  return {
    ...options,
    errorCode: errorCode ?? options.errorCode,
    errorMessage: errorMessage ?? options.errorMessage,
  };
}
