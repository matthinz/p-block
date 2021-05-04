import { AndValidator } from "./and";
import { OrValidator } from "./or";
import {
  FluentArrayValidator,
  ArrayValidator,
  defaultArrayParser,
} from "./array";
import { FluentBooleanValidator, BooleanValidator } from "./boolean";
import { FluentDateValidator, DateValidator } from "./date";
import { FluentNumberValidator, NumberValidator } from "./number";
import {
  defaultObjectParser,
  FluentObjectValidator,
  ObjectValidator,
} from "./object";
import { FluentStringValidator, StringValidator } from "./string";
import { AlwaysValidator } from "./always";
import { FluentUrlValidator, UrlValidator } from "./url";
import { Parser } from "./types";

export { FluentArrayValidator } from "./array";
export { FluentBooleanValidator } from "./boolean";
export { FluentDateValidator } from "./date";
export { FluentNumberValidator } from "./number";
export { FluentObjectValidator } from "./object";
export { FluentStringValidator } from "./string";
export { FluentUrlValidator } from "./url";

export { ParsedType } from "./types";

const arrayValidator: FluentArrayValidator<unknown> = new ArrayValidator<unknown>(
  defaultArrayParser
);
const booleanValidator: FluentBooleanValidator = new BooleanValidator();
const dateValidator: FluentDateValidator = new DateValidator();
const numberValidator: FluentNumberValidator = new NumberValidator();
const objectValidator: FluentObjectValidator<
  Record<string, unknown>
> = new ObjectValidator(defaultObjectParser);
const stringValidator: FluentStringValidator = new StringValidator();
const urlValidator: FluentUrlValidator = new UrlValidator();

class FluentValidationRoot {
  allOf<Type>(...validators: Parser<Type>[]): Parser<Type> {
    return validators.reduce(
      (result, validator) => new AndValidator(result, validator),
      new AlwaysValidator<Type>()
    );
  }

  anyOf<Parsers extends Parser<any>[]>(
    ...validators: Parsers
  ): Parsers extends Parser<infer Type>[] ? Parser<Type> : never {
    type Result = Parsers extends Parser<infer Type>[] ? Parser<Type> : never;

    if (validators.length === 0) {
      throw new Error("anyOf() requires at least one argument");
    }

    return validators.reduce<Parser<any> | undefined>((result, validator) => {
      return result ? new OrValidator(result, validator) : validator;
    }, undefined) as Result;
  }

  isArray(): FluentArrayValidator<unknown> {
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

  isURL(): FluentUrlValidator {
    return urlValidator;
  }
}

export const V = new FluentValidationRoot();
