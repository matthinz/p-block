import { BasicValidator } from "./basic";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationFunction,
  Validator,
} from "./types";
import { composeValidators } from "./utils";

export interface FluentBooleanValidator extends FluentValidator<boolean> {
  defaultedTo(value: boolean): FluentBooleanValidator;
  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentBooleanValidator;
}

export class BooleanValidator
  extends BasicValidator<boolean>
  implements FluentBooleanValidator {
  constructor(
    parent?: BooleanValidator | TypeValidationFunction<any, boolean>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<boolean> | Validator<boolean>
  ) {
    super(parent ?? "boolean", normalizers, validator);
  }

  defaultedTo(value: boolean): FluentBooleanValidator {
    return this.normalizedWith((input) => {
      return input == null ? value : input;
    });
  }

  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator {
    return this.passes(
      (value) => !value,
      errorCode ?? "isFalse",
      errorMessage ?? "input must be false"
    );
  }

  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator {
    return this.passes(
      (value) => value,
      errorCode ?? "isTrue",
      errorMessage ?? "input must be true"
    );
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentBooleanValidator {
    return new BooleanValidator(this, normalizers);
  }

  passes(
    validators:
      | ValidationFunction<boolean>
      | Validator<boolean>
      | (ValidationFunction<boolean> | Validator<boolean>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanValidator {
    return new BooleanValidator(
      this,
      [],
      composeValidators(validators, errorCode, errorMessage)
    );
  }
}
