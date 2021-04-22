import { BasicValidator } from "./basic";
import { enableThrowing, setErrorOptions } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";

export interface FluentBooleanValidator extends FluentValidator<boolean> {
  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  shouldThrow(): FluentBooleanValidator;
}

export class BooleanValidator
  extends BasicValidator<any, boolean>
  implements FluentBooleanValidator {
  constructor(
    parent?: BooleanValidator | TypeValidationFunction<any, boolean>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?: ValidationFunction<boolean> | ValidationFunction<boolean>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? "boolean", normalizers, validators, options);
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
    throw new Error();
  }

  shouldThrow(): FluentBooleanValidator {
    return new BooleanValidator(this, [], [], enableThrowing(this.options));
  }

  passes(
    validator: ValidationFunction<boolean>,
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanValidator {
    return new BooleanValidator(
      this,
      [],
      validator,
      setErrorOptions(this.options, errorCode, errorMessage)
    );
  }
}
