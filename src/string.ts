import { BasicValidator } from "./basic";
import { BooleanValidator, FluentBooleanValidator } from "./boolean";
import { DateValidator, FluentDateValidator } from "./date";
import { enableThrowing } from "./errors";
import { FluentNumberValidator, NumberValidator } from "./number";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationContext,
  ValidationFunction,
  ValidatorOptions,
} from "./types";

export interface FluentStringValidator extends FluentValidator<string> {
  /**
   * @returns A FluentStringValidator, derived from this one, that validates its input is included in `values`. This check is strict--case matters.
   */
  isIn(
    values: string[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

  /**
   * @returns A FluentStringValidator that converts input to lower case before validating.
   */
  lowerCased(): FluentStringValidator;

  matches(
    regex: RegExp,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

  maxLength(
    max: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

  minLength(
    min: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentStringValidator;

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringValidator;

  parsedAs<Type>(
    parser: ((input: string) => Type) | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentValidator<Type>;

  parsedAsBoolean(
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanValidator;

  parsedAsBoolean(
    parser?: (input: string) => boolean | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanValidator;

  parsedAsDate(
    parser?: (input: string) => Date | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateValidator;

  parsedAsFloat(
    parser: (input: string) => number | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  parsedAsFloat(
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  parsedAsInteger(
    base?: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  parsedAsInteger(
    parser: (input: string) => number | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param check
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentStringValidator configured to perform an additional check.
   */
  passes(
    validator: ValidationFunction<string> | ValidationFunction<string>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

  /**
   * @returns A FluentStringValidator, derived from this one, configured to throw exceptions on validation failure.
   */
  shouldThrow(): FluentStringValidator;

  /**
   * @returns A FluentStringValidator, derived from this one, that trims leading and trailing whitespace from input before validation.
   */
  trimmed(): FluentStringValidator;

  /**
   * @returns A FluentStringValidator, derived from this one, that converts inputs to uppercase before validation.
   */
  upperCased(): FluentStringValidator;
}

export class StringValidator
  extends BasicValidator<any, string>
  implements FluentStringValidator {
  constructor(
    parent?: TypeValidationFunction<any, string> | StringValidator,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?: ValidationFunction<string> | ValidationFunction<string>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? "string", normalizers, validators, options);
  }

  isIn(
    values: string[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    return this.passes(
      (input) => values.includes(input),
      errorCode,
      errorMessage
    );
  }

  lowerCased(): FluentStringValidator {
    return this.normalizedWith((value: any) =>
      typeof value === "string" ? value.toLowerCase() : value
    );
  }

  matches(
    regex: RegExp,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    return this.passes(
      (input) => regex.test(input),
      errorCode ?? "matches",
      errorMessage ?? `input must match regular expression ${regex}`
    );
  }

  maxLength(max: number, errorCode?: string, errorMessage?: string) {
    return this.passes(
      (input) => input.length <= max,
      errorCode ?? "maxLength",
      errorMessage ??
        `input length must be less than or equal to ${max} character(s)`
    );
  }

  minLength(min: number, errorCode?: string, errorMessage?: string) {
    return this.passes(
      (input) => input.length >= min,
      errorCode ?? "minLength",
      errorMessage ??
        `input length must be greater than or equal to ${min} character(s)`
    );
  }

  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentStringValidator {
    return new StringValidator(this, normalizer, [], this.options);
  }

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringValidator {
    return this.minLength(
      1,
      errorCode ?? "notEmpty",
      errorMessage ?? "input cannot be an empty string"
    );
  }

  parsedAs<Type>(): FluentValidator<Type> {
    throw new Error();
  }

  parsedAsBoolean(
    parserOrErrorCode?: ((input: string) => boolean | undefined) | string,
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentBooleanValidator {
    // The normalizer's job is taking arbitrary input and attempt to parse
    // it as a boolean value. If parsing fails, it will return input unmodified.
    const normalizer = (input: any): any => {
      input = this.normalize(input);

      if (typeof input !== "string") {
        return input;
      }

      const parser =
        typeof parserOrErrorCode === "function"
          ? parserOrErrorCode
          : defaultBooleanParser;

      const parsed = parser(input);
      if (parsed !== undefined) {
        return parsed;
      }

      return input;
    };

    // parentValidator's job is to be the new "root" for the hierarchy of
    // Boolean validators.
    const parentValidator = (
      input: any,
      context?: ValidationContext
    ): input is boolean => {
      if (typeof input === "boolean") {
        return true;
      }

      // This may return `true` even though input is not a boolean.
      // However, the next validator (below) will fix that.
      return this.validate(input, context);
    };

    const validator = (input: any, context?: ValidationContext): boolean => {
      if (typeof input === "boolean") {
        return true;
      }

      let code =
        typeof parserOrErrorCode === "string"
          ? parserOrErrorCode
          : errorCodeOrErrorMessage;

      let message: string | undefined;

      if (code === undefined) {
        code = "parsedAsBoolean";
        message = "input could not be parsed as a boolean";
      } else {
        message =
          (typeof parserOrErrorCode === "string"
            ? errorCodeOrErrorMessage
            : errorMessage) ?? code;
      }

      return (
        context?.handleErrors([
          {
            code,
            message,
            path: context?.path ?? [],
          },
        ]) ?? false
      );
    };

    return new BooleanValidator(parentValidator, normalizer, validator);
  }

  parsedAsDate(
    parserOrErrorCode?: string | ((input: string) => Date | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentDateValidator {
    const normalizer = (input: any): any => {
      input = this.normalize(input);

      if (typeof input !== "string") {
        return input;
      }

      const parser =
        typeof parserOrErrorCode === "function"
          ? parserOrErrorCode
          : defaultDateParser;

      const parsed = parser(input);

      return parsed === undefined ? input : parsed;
    };

    const parentValidator = (
      input: any,
      context?: ValidationContext
    ): input is Date => {
      if (input instanceof Date) {
        return true;
      }

      return this.validate(input, context);
    };

    const validator = (input: any, context?: ValidationContext): boolean => {
      if (input instanceof Date) {
        return true;
      }

      let code =
        typeof parserOrErrorCode === "function"
          ? errorCodeOrErrorMessage
          : parserOrErrorCode;
      let message: string;

      if (code === undefined) {
        code = "parsedAsDate";
        message = "input could not be parsed as a Date";
      } else {
        message =
          (typeof parserOrErrorCode === "function"
            ? errorMessage
            : errorCodeOrErrorMessage) ?? code;
      }

      return (
        context?.handleErrors([
          {
            code,
            message,
            path: context?.path ?? [],
          },
        ]) ?? false
      );
    };

    return new DateValidator(parentValidator, normalizer, validator);
  }

  parsedAsFloat(
    parserOrErrorCode?: string | ((input: string) => number | undefined),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  parsedAsInteger(
    baseOrParserOrErrorCode?:
      | ((input: string) => number | undefined)
      | number
      | string,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    throw new Error();
  }

  passes(
    validator: ValidationFunction<string> | ValidationFunction<string>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    return new StringValidator(this, [], validator, {
      ...this.options,
      errorCode: errorCode ?? "invalid",
      errorMessage: errorMessage ?? "input was invalid",
    });
  }

  shouldThrow(): FluentStringValidator {
    return new StringValidator(this, [], [], enableThrowing(this.options));
  }

  trimmed(): FluentStringValidator {
    return this.normalizedWith((str) => str.trim());
  }

  upperCased(): FluentStringValidator {
    return this.normalizedWith((str) => str.toUpperCase());
  }
}

function defaultBooleanParser(input: string): boolean | undefined {
  const TRUE_REGEX = /^(y|Y|yes|Yes|YES|true|True|TRUE|on|On|ON)$/;
  const FALSE_REGEX = /^(n|N|no|No|NO|false|False|FALSE|off|Off|OFF)$/;

  if (TRUE_REGEX.test(input)) {
    return true;
  }

  if (FALSE_REGEX.test(input)) {
    return false;
  }
}

function defaultDateParser(input: string): Date | undefined {
  try {
    /*
     * > Note: Parsing of date strings with the Date constructor (and
     * > Date.parse(), which works the same way) is strongly discouraged due
     * > to browser differences and inconsistencies.
     * >
     * >   - Support for RFC 2822 format strings is by convention only.
     * >   - Support for ISO 8601 formats differs in that date-only strings (e.g. "1970-01-01") are treated as UTC, not local.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
     */
    const date = new Date(input);

    return isNaN((date as unknown) as number) ? undefined : date;
  } catch (err) {
    return undefined;
  }
}
