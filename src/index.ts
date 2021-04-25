import { AndValidator } from "./and";
import { OrValidator } from "./or";
import { FluentArrayValidator, ArrayValidator } from "./array";
import { FluentBooleanValidator, BooleanValidator } from "./boolean";
import { FluentDateValidator, DateValidator } from "./date";
import { FluentNumberValidator, NumberValidator } from "./number";
import { FluentObjectValidator, ObjectValidator } from "./object";
import { FluentStringValidator, StringValidator } from "./string";
import { AlwaysValidator } from "./always";
import { Validator } from "./types";

export { FluentArrayValidator } from "./array";
export { FluentBooleanValidator } from "./boolean";
export { FluentDateValidator } from "./date";
export { FluentNumberValidator } from "./number";
export { FluentObjectValidator } from "./object";
export { FluentStringValidator } from "./string";

const arrayValidator: FluentArrayValidator<any> = new ArrayValidator<any>();
const booleanValidator: FluentBooleanValidator = new BooleanValidator();
const dateValidator: FluentDateValidator = new DateValidator();
const numberValidator: FluentNumberValidator = new NumberValidator();
const objectValidator: FluentObjectValidator<
  Record<string, unknown>
> = new ObjectValidator();
const stringValidator: FluentStringValidator = new StringValidator();

class FluentValidationRoot {
  allOf<Type>(...validators: Validator<Type>[]): Validator<Type> {
    return validators.reduce(
      (result, validator) => new AndValidator(result, validator),
      new AlwaysValidator<Type>()
    );
  }

  anyOf<Validators extends Validator<any>[]>(
    ...validators: Validators
  ): Validators extends Validator<infer Type>[] ? Validator<Type> : never {
    type Result = Validators extends Validator<infer Type>[]
      ? Validator<Type>
      : never;

    if (validators.length === 0) {
      throw new Error("anyOf() requires at least one argument");
    }

    return validators.reduce<Validator<any> | undefined>(
      (result, validator) => {
        return result ? new OrValidator(result, validator) : validator;
      },
      undefined
    ) as Result;
  }

  isArray(): FluentArrayValidator<any> {
    return arrayValidator;
  }

  isBoolean(): FluentBooleanValidator {
    return booleanValidator;
  }

  isDate(): FluentDateValidator {
    return dateValidator;
  }

  isNumber(): FluentNumberValidator {
    return numberValidator;
  }

  isObject(): FluentObjectValidator<Record<string, unknown>> {
    return objectValidator;
  }

  isString(): FluentStringValidator {
    return stringValidator;
  }
}

export const V = new FluentValidationRoot();
