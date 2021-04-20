import {
  ValidationContext,
  ValidationErrorDetails,
  ValidatorOptions,
} from "./types";

export class ValidationError extends Error {
  readonly errors: ValidationErrorDetails[];

  constructor(errors: ValidationErrorDetails[]) {
    super("Validation failed");

    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }
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
