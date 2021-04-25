import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";
import { composeValidators } from "./utils";

export interface FluentNumberValidator extends FluentValidator<number> {
  defaultedTo(value: number): FluentNumberValidator;

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
   * @returns A new FluentNumberValidator, derived from this one, that truncates the decimal portion of its input before validation.
   */
  truncated(): FluentNumberValidator;
}

export class NumberValidator
  extends BasicValidator<number>
  implements FluentNumberValidator {
  constructor(
    parent?: NumberValidator | TypeValidationFunction<any, number>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<number> | Validator<number>,
    options?: ValidatorOptions
  ) {
    const noArgumentsSupplied =
      parent === undefined &&
      normalizers === undefined &&
      validator === undefined &&
      options === undefined;
    if (noArgumentsSupplied) {
      validator = validateNumberIsFinite;
    }

    super(parent ?? "number", normalizers, validator);
  }

  defaultedTo(value: number): FluentNumberValidator {
    return this.normalizedWith((input) => (input == null ? value : input));
  }

  equalTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs === rhs,
      "equalTo",
      (lhs, rhs) => `input must be equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  greaterThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs > rhs,
      "greaterThan",
      (lhs, rhs) => `input must be greater than ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  greaterThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs >= rhs,
      "greaterThanOrEqualTo",
      (lhs, rhs) => `input must be greater than or equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  lessThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs < rhs,
      "lessThan",
      (lhs, rhs) => `input must be less than ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  lessThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs <= rhs,
      "lessThanOrEqualTo",
      (lhs, rhs) => `input must be less than or equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentNumberValidator {
    return new NumberValidator(
      this,
      Array.isArray(normalizers) ? normalizers : [normalizers]
    );
  }

  passes(
    validators:
      | ValidationFunction<number>
      | Validator<number>
      | (ValidationFunction<number> | Validator<number>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return new NumberValidator(
      this,
      [],
      composeValidators(validators, errorCode, errorMessage)
    );
  }

  roundedTo(decimalPlaces = 0): FluentNumberValidator {
    const normalizer = (input: any) => {
      if (typeof input !== "number") {
        return input;
      }

      if (!isFinite(input)) {
        return input;
      }

      const exp = Math.pow(10, decimalPlaces);

      return Math.round(input * exp) / exp;
    };

    return new NumberValidator(this, normalizer);
  }

  truncated(): FluentNumberValidator {
    const normalizer = (input: any) => {
      if (typeof input !== "number") {
        return input;
      }

      if (!isFinite(input)) {
        return input;
      }

      return Math.floor(input);
    };
    return new NumberValidator(this, normalizer);
  }

  private passesComparison(
    value: number | (() => number),
    comparison: (lhs: number, rhs: number) => boolean,
    defaultErrorCode: string,
    defaultErrorMessage: (lhs: number, rhs: number) => string,
    providedErrorCode?: string,
    providedErrorMessage?: string
  ): FluentNumberValidator {
    function comparisonValidator(input: number): true | ValidationErrorDetails {
      const valueToCompareAgainst =
        typeof value === "function" ? value() : value;
      if (comparison(input, valueToCompareAgainst)) {
        return true;
      }

      const [errorCode, errorMessage] = resolveErrorDetails(
        defaultErrorCode,
        defaultErrorMessage(input, valueToCompareAgainst),
        providedErrorCode,
        providedErrorMessage
      );

      return {
        code: errorCode,
        message: errorMessage,
        path: [],
      };
    }
    return new NumberValidator(this, [], comparisonValidator);
  }
}

function validateNumberIsFinite(input: number): true | ValidationErrorDetails {
  if (!isFinite(input)) {
    return {
      code: "invalidNumber",
      message: "input must be a finite number",
      path: [],
    };
  }

  return true;
}
