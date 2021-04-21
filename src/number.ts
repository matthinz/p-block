import { BasicValidator } from "./basic";
import { enableThrowing, ValidationError } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  ValidatorOptions,
} from "./types";

export interface FluentNumberValidator extends FluentValidator<number> {
  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is equal to a given value.
   */
  equalTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is greater than a given value.
   */
  greaterThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is greater than or equal to a given value.
   */
  greaterThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is less than a given value.
   */
  lessThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is less than or equal to a given value.
   */
  lessThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @returns A new FluentNumberValidator, derived from this one, that normalizes inputs using the given normalization functions.
   */
  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentNumberValidator;

  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators: ValidationFunction<number> | ValidationFunction<number>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param decimalPlaces
   * @returns A new FluentNumberValidator, derived from this one, that rounds its input to the given number of decimal places before validating.
   */
  roundedTo(decimalPlaces: number): FluentNumberValidator;

  /**
   * @returns A new FluentNumberValidator, configured to throw exceptions.
   */
  shouldThrow(): FluentNumberValidator;

  /**
   * @returns A new FluentNumberValidator, derived from this one, that truncates the decimal portion of its input before validation.
   */
  truncated(): FluentNumberValidator;
}

export class NumberValidator
  extends BasicValidator<any, number>
  implements FluentNumberValidator {
  constructor(
    parent?: NumberValidator,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?: ValidationFunction<number> | ValidationFunction<number>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? "number", normalizers, validators, options);
  }

  equalTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  greaterThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  greaterThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  lessThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  lessThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentNumberValidator {
    return new NumberValidator(
      this,
      Array.isArray(normalizers) ? normalizers : [normalizers],
      [],
      this.options
    );
  }

  passes(
    validators: ValidationFunction<number> | ValidationFunction<number>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return new NumberValidator(this, [], validators, {
      ...this.options,
      errorCode: errorCode ?? this.options.errorCode,
      errorMessage: errorMessage ?? this.options.errorMessage,
    });
  }

  roundedTo(decimalPlaces: number = 0): FluentNumberValidator {
    const exp = Math.pow(10, decimalPlaces);
    return new NumberValidator(
      this,
      (num) => Math.round(num * exp) / exp,
      [],
      this.options
    );
  }

  shouldThrow(): FluentNumberValidator {
    return new NumberValidator(this, [], [], enableThrowing(this.options));
  }

  truncated(): FluentNumberValidator {
    return new NumberValidator(
      this,
      (num) => Math.floor(num),
      [],
      this.options
    );
  }
}
