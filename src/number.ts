import { BasicValidator } from "./basic";
import {
  NormalizationFunction,
  ValidationFunction,
  ValidatorOptions,
} from "./types";

export class NumberValidator extends BasicValidator<number> {
  constructor(
    parent: NumberValidator | undefined,
    normalizers:
      | NormalizationFunction<number>
      | NormalizationFunction<number>[],
    validators: ValidationFunction<number> | ValidationFunction<number>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? "number", normalizers, validators, options);
  }

  greaterThan() {}
  greaterThanOrEqualTo() {}
  isInteger() {}
  lessThan() {}
  lessThanOrEqualTo() {}

  /**
   * @param decimalPlaces
   * @returns A NumberValidator that normalizes its inputs by rounding.
   */
  rounded(decimalPlaces: number = 0): NumberValidator {
    const exp = Math.pow(10, decimalPlaces);
    return new NumberValidator(
      this,
      (num) => Math.round(num * exp) / exp,
      [],
      this.options
    );
  }

  /**
   * @returns A NumberValidator that normalizes its inputs by removing any decimal portion.
   */
  truncated(): NumberValidator {
    return new NumberValidator(
      this,
      (num) => Math.floor(num),
      [],
      this.options
    );
  }
}
