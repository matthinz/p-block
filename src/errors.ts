import { ValidationErrorDetails } from "./types";

export class ValidationError extends Error {
  readonly errors: ValidationErrorDetails[];

  constructor(errors: ValidationErrorDetails[]) {
    super("Validation failed");

    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }
}
