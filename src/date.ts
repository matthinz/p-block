import { BasicValidator } from "./basic";
import { enableThrowing } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationContext,
  ValidationFunction,
  ValidatorOptions,
} from "./types";

export interface FluentDateValidator extends FluentValidator<Date> {
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

  passes(
    validator: ValidationFunction<Date>,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  shouldThrow(): FluentDateValidator;
}

function isDate(input: any, context?: ValidationContext): input is Date {
  if (input == null || !(input instanceof Date)) {
    return (
      context?.handleErrors([
        {
          code: "invalidType",
          message: "input must be a Date",
          path: context?.path ?? [],
        },
      ]) ?? false
    );
  }

  // e.g. new Date("not a real date") yields a Date that is also NaN.
  if (isNaN((input as unknown) as number)) {
    return (
      context?.handleErrors([
        {
          code: "invalidDate",
          message: "input must represent a valid Date",
          path: context?.path ?? [],
        },
      ]) ?? false
    );
  }

  return true;
}

export class DateValidator
  extends BasicValidator<any, Date>
  implements FluentDateValidator {
  constructor(
    parent?: DateValidator | TypeValidationFunction<any, Date>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?: ValidationFunction<Date> | ValidationFunction<Date>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? isDate, normalizers, validators, options);
  }

  equalTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  greaterThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  greaterThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  lessThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  lessThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  normalizedWith(
    normalizers: NormalizationFunction[] | NormalizationFunction
  ): FluentDateValidator {
    throw new Error();
  }

  passes(
    validator: ValidationFunction<Date>,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator {
    throw new Error();
  }

  shouldThrow() {
    return new DateValidator(this, [], [], enableThrowing(this.options));
  }
}
