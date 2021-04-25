import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";
import { composeValidators } from "./utils";

export interface FluentDateValidator extends FluentValidator<Date> {
  defaultedTo(value: Date): FluentDateValidator;

  equalTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  greaterThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  greaterThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  lessThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  lessThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentDateValidator;

  passes(
    validator: ValidationFunction<Date>,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;
}

function isDate(input: any, errors?: ValidationErrorDetails[]): input is Date {
  if (input == null || !(input instanceof Date)) {
    errors?.push({
      code: "invalidType",
      message: "input must be a Date",
      path: [],
    });
    return false;
  }

  // e.g. new Date("not a real date") yields a Date that is also NaN.
  if (isNaN(input.getTime())) {
    errors?.push({
      code: "invalidDate",
      message: "input must represent a valid Date",
      path: [],
    });
    return false;
  }

  return true;
}

export class DateValidator
  extends BasicValidator<Date>
  implements FluentDateValidator {
  constructor(
    parent?: DateValidator | TypeValidationFunction<any, Date>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<Date> | Validator<Date>
  ) {
    super(parent ?? isDate, normalizers, validator);
  }

  defaultedTo(value: Date): FluentDateValidator {
    return this.normalizedWith((input) => input ?? value);
  }

  equalTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs.getTime() === rhs.getTime(),
      "equalTo",
      (lhs, rhs) => `input must be equal to ${rhs.toISOString()}`,
      errorCode,
      errorMessage
    );
  }

  greaterThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs > rhs,
      "greaterThan",
      (lhs, rhs) => `input must be greater than ${rhs.toISOString()}`,
      errorCode,
      errorMessage
    );
  }

  greaterThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs >= rhs,
      "greaterThanOrEqualTo",
      (lhs, rhs) =>
        `input must be greater than or equal to ${rhs.toISOString()}`,
      errorCode,
      errorMessage
    );
  }

  lessThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs < rhs,
      "lessThan",
      (lhs, rhs) => `input must be less than ${rhs.toISOString()}`,
      errorCode,
      errorMessage
    );
  }

  lessThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs <= rhs,
      "lessThanOrEqualTo",
      (lhs, rhs) => `input must be less than or equal to ${rhs.toISOString()}`,
      errorCode,
      errorMessage
    );
  }

  normalizedWith(
    normalizers: NormalizationFunction[] | NormalizationFunction
  ): FluentDateValidator {
    return new DateValidator(this, normalizers);
  }

  passes(
    validators:
      | ValidationFunction<Date>
      | Validator<Date>
      | (ValidationFunction<Date> | Validator<Date>),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return new DateValidator(
      this,
      [],
      composeValidators(validators, errorCode, errorMessage)
    );
  }

  private passesComparison(
    value: Date | (() => Date),
    comparison: (lhs: Date, rhs: Date) => boolean,
    defaultErrorCode: string,
    defaultErrorMessage: (lhs: Date, rhs: Date) => string,
    providedErrorCode?: string,
    providedErrorMessage?: string
  ): FluentDateValidator {
    return this.passes((input) => {
      const comparator = typeof value === "function" ? value() : value;

      if (comparison(input, comparator)) {
        return true;
      }

      const [errorCode, errorMessage] = resolveErrorDetails(
        defaultErrorCode,
        defaultErrorMessage(input, comparator),
        providedErrorCode,
        providedErrorMessage
      );

      return {
        code: errorCode,
        message: errorMessage,
        path: [],
      };
    });
  }
}
