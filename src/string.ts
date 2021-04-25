import { BasicValidator } from "./basic";
import { BooleanValidator, FluentBooleanValidator } from "./boolean";
import { DateValidator, FluentDateValidator } from "./date";
import { resolveErrorDetails } from "./errors";
import { FluentNumberValidator, NumberValidator } from "./number";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";
import { composeValidators } from "./utils";

export interface FluentStringValidator extends FluentValidator<string> {
  /**
   * @param value
   * @returns A FluentStringValidator, derived from this one, that will fill in the given default value when input is null or undefined.
   */
  defaultedTo(value: string): FluentStringValidator;

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
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  parsedAsInteger(
    base: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  parsedAsInteger(
    parser: (input: string) => number | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @returns A new FluentStringValidator configured to perform the given additional checks
   */
  passes(
    validators:
      | ValidationFunction<string>
      | Validator<string>
      | (ValidationFunction<string> | Validator<string>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator;

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
  extends BasicValidator<string>
  implements FluentStringValidator {
  constructor(
    parent?: TypeValidationFunction<any, string> | StringValidator,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<string> | Validator<string>
  ) {
    super(parent ?? "string", normalizers, validator);
  }

  defaultedTo(value: string): FluentStringValidator {
    return this.normalizedWith((input) => input ?? value);
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

  maxLength(
    max: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    return this.passes(
      (input) => input.length <= max,
      errorCode ?? "maxLength",
      errorMessage ??
        `input length must be less than or equal to ${max} character(s)`
    );
  }

  minLength(
    min: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    [errorCode, errorMessage] = resolveErrorDetails(
      "minLength",
      `input length must be greater than or equal to ${min} character(s)`,
      errorCode,
      errorMessage
    );

    return this.passes((input) => input.length >= min, errorCode, errorMessage);
  }

  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentStringValidator {
    return new StringValidator(this, normalizer);
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
    // parentValidator's job is to be the new "root" for the hierarchy of
    // Boolean validators. It can "lie" about input being a boolean if
    // `normalizer` will be able to do something about it.
    const parentValidator = (
      input: any,
      errors?: ValidationErrorDetails[]
    ): input is boolean => {
      if (typeof input === "boolean") {
        return true;
      }

      const parse = this.parse(input);
      if (!parse.success) {
        errors?.push(...parse.errors);
        return false;
      }

      return true;
    };

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

    const validator = (input: any): true | ValidationErrorDetails => {
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

      return {
        code,
        message,
        path: [],
      };
    };

    return new BooleanValidator(parentValidator, normalizer, validator);
  }

  parsedAsDate(
    parserOrErrorCode?: string | ((input: string) => Date | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentDateValidator {
    const parentValidator = (
      input: any,
      errors?: ValidationErrorDetails[]
    ): input is Date => {
      if (input instanceof Date) {
        return true;
      }

      const parse = this.parse(input);
      if (!parse.success) {
        errors?.push(...parse.errors);
        return false;
      }

      return true;
    };

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

    const validator = (input: any): true | ValidationErrorDetails => {
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

      return { code, message, path: [] };
    };

    return new DateValidator(parentValidator, normalizer, validator);
  }

  parsedAsFloat(
    parserOrErrorCode?: string | ((input: string) => number | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    const parentValidator = (
      input: any,
      errors?: ValidationErrorDetails[]
    ): input is number => {
      if (typeof input === "number") {
        return true;
      }

      const parsed = this.parse(input);
      if (!parsed.success) {
        errors?.push(...parsed.errors);
        return false;
      }

      return true;
    };

    const normalizer = (input: any): any => {
      if (typeof input !== "string") {
        return input;
      }

      const parser =
        typeof parserOrErrorCode === "function"
          ? parserOrErrorCode
          : defaultFloatParser;

      const parsed = parser(input);

      return parsed ?? input;
    };

    const validator = (input: any): true | ValidationErrorDetails => {
      if (typeof input === "number") {
        return true;
      }

      const [code, message] = resolveErrorDetails(
        "parsedAsFloat",
        "input could not be parsed as a float",
        typeof parserOrErrorCode === "function"
          ? errorCodeOrErrorMessage
          : parserOrErrorCode,
        typeof parserOrErrorCode === "function"
          ? errorMessage
          : errorCodeOrErrorMessage
      );

      return { code, message, path: [] };
    };

    return new NumberValidator(parentValidator, normalizer, validator);
  }

  parsedAsInteger(
    radixOrParserOrErrorCode?:
      | ((input: string) => number | undefined)
      | number
      | string,
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    if (typeof radixOrParserOrErrorCode === "number") {
      if (radixOrParserOrErrorCode < 2 || radixOrParserOrErrorCode > 36) {
        throw new Error("radix must be between 2 and 36, inclusive");
      }
    }

    const parentValidator = (
      input: any,
      errors?: ValidationErrorDetails[]
    ): input is number => {
      if (typeof input === "number") {
        return true;
      }

      const parsed = this.parse(input);
      if (!parsed.success) {
        errors?.push(...parsed.errors);
        return false;
      }

      return true;
    };

    const normalizer = (input: any): any => {
      input = this.normalize(input);

      if (typeof input !== "string") {
        return input;
      }

      const parser =
        typeof radixOrParserOrErrorCode === "function"
          ? radixOrParserOrErrorCode
          : defaultIntegerParser.bind(
              undefined,
              typeof radixOrParserOrErrorCode === "number"
                ? radixOrParserOrErrorCode
                : 10
            );

      const parsed = parser(input);

      return parsed ?? input;
    };

    const validator = (input: any): true | ValidationErrorDetails => {
      if (typeof input === "number") {
        return true;
      }

      const [code, message] = resolveErrorDetails(
        "parsedAsInteger",
        "input could not be parsed as an integer",
        typeof radixOrParserOrErrorCode === "string"
          ? radixOrParserOrErrorCode
          : errorCodeOrErrorMessage,
        typeof radixOrParserOrErrorCode === "string"
          ? errorCodeOrErrorMessage
          : errorMessage
      );

      return {
        code,
        message,
        path: [],
      };
    };

    return new NumberValidator(parentValidator, normalizer, validator);
  }

  passes(
    validators:
      | ValidationFunction<string>
      | Validator<string>
      | (ValidationFunction<string> | Validator<string>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringValidator {
    const [effectiveErrorCode, effectiveErrorMessage] = resolveErrorDetails(
      "invalid",
      "input was invalid",
      errorCode,
      errorMessage
    );

    const validator = composeValidators(
      validators,
      effectiveErrorCode,
      effectiveErrorMessage
    );

    return new StringValidator(this, [], validator);
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
  const JUST_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

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

    let date: Date;

    const m = JUST_DATE.exec(input);
    if (m) {
      date = new Date(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10)
      );
    } else {
      date = new Date(input);
    }

    return isNaN(date.getTime()) ? undefined : date;
  } catch (err) {
    return undefined;
  }
}

function defaultIntegerParser(
  radix: number,
  input: string
): number | undefined {
  // Allow integers ending in e.g. ".0000" to parse successfully
  input = input.trim().replace(/\.0+$/, "");

  const parsed = parseInt(input, radix);

  if (!isFinite(parsed)) {
    return undefined;
  }

  // parseInt() will stop reading input when it encounters a
  // character it is not expecting. Our default parser is
  // going to be more strict than this--we verify that stringifying
  // the resulting value at the same radix results in the same string.

  const inputWasWellFormed =
    parsed.toString(radix).toLowerCase() === input.toLowerCase();

  return inputWasWellFormed ? parsed : undefined;
}

function defaultFloatParser(input: string): number | undefined {
  // Allow integers ending in e.g. ".0000" to parse successfully
  input = input.trim().replace(/\.0+$/, "");

  const parsed = parseFloat(input);

  if (!isFinite(parsed)) {
    return undefined;
  }

  // parseFloat() will stop reading input when it encounters a
  // character it is not expecting. Our default parser is
  // going to be more strict than this--we verify that stringifying
  // the resulting value results in the same string.

  const inputWasWellFormed = parsed.toString() === input;

  return inputWasWellFormed ? parsed : undefined;
}
