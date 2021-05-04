import { BasicValidator } from "./basic";
import { BooleanValidator, FluentBooleanValidator } from "./boolean";
import { DateValidator, FluentDateValidator } from "./date";
import { resolveErrorDetails } from "./errors";
import { FluentNumberValidator, NumberValidator } from "./number";
import {
  NormalizationFunction,
  Parser,
  ParseResult,
  ParsingFunction,
  ValidationErrorDetails,
  ValidationFunction,
} from "./types";
import { FluentUrlValidator, UrlValidator } from "./url";

const InvalidTypeParseResult: ParseResult<string> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be of type 'string'",
      path: [],
    },
  ],
};

const EmptyErrorArray: ReadonlyArray<ValidationErrorDetails> = [];

export interface FluentStringValidator extends Parser<string> {
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
    normalizer: NormalizationFunction<string> | NormalizationFunction<string>[]
  ): FluentStringValidator;

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringValidator;

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

  parsedAsURL(errorCode?: string, errorMessage?: string): FluentUrlValidator;

  parsedAsURL(
    parser: (input: string) => URL | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentUrlValidator;

  /**
   * @returns A new FluentStringValidator configured to perform the given additional checks
   */
  passes(
    validators: ValidationFunction<string> | ValidationFunction<string>[],
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
  extends BasicValidator<string, FluentStringValidator>
  implements FluentStringValidator {
  constructor(
    parser?: ParsingFunction<string>,
    normalizer?: NormalizationFunction<string>,
    validator?: ValidationFunction<string>
  ) {
    super(
      StringValidator,
      parser ?? defaultStringParser,
      normalizer,
      validator
    );
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

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringValidator {
    return this.minLength(
      1,
      errorCode ?? "notEmpty",
      errorMessage ?? "input cannot be an empty string"
    );
  }

  parsedAsBoolean(
    parserOrErrorCode?: ((input: string) => boolean | undefined) | string,
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentBooleanValidator {
    return this.internalParsedAs(
      BooleanValidator,
      defaultBooleanParser,
      "parsedAsBoolean",
      "input could not be parsed as a boolean",
      parserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
  }

  parsedAsDate(
    parserOrErrorCode?: string | ((input: string) => Date | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentDateValidator {
    return this.internalParsedAs(
      DateValidator,
      defaultDateParser,
      "parsedAsDate",
      "input could not be parsed as a Date",
      parserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
  }

  parsedAsFloat(
    parserOrErrorCode?: string | ((input: string) => number | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.internalParsedAs(
      NumberValidator,
      defaultFloatParser,
      "parsedAsFloat",
      "input could not be parsed as a float",
      parserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
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
      radixOrParserOrErrorCode = defaultIntegerParser.bind(
        undefined,
        radixOrParserOrErrorCode
      );
    }

    return this.internalParsedAs(
      NumberValidator,
      defaultIntegerParser.bind(undefined, 10),
      "parsedAsInteger",
      "input could not be parsed as an integer",
      radixOrParserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
  }

  parsedAsURL(
    parserOrErrorCode?: string | ((input: string) => URL | undefined),
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentUrlValidator {
    return this.internalParsedAs(
      UrlValidator,
      defaultURLParser,
      "parsedAsURL",
      "input cannot be parsed as a URL",
      parserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
  }

  trimmed(): FluentStringValidator {
    return this.normalizedWith((str) => str.trim());
  }

  upperCased(): FluentStringValidator {
    return this.normalizedWith((str) => str.toUpperCase());
  }

  protected internalParsedAs<Type, ValidatorType extends Parser<Type>>(
    ctor: { new (parser: ParsingFunction<Type>): ValidatorType },
    defaultParser: (input: string) => Type | undefined,
    defaultErrorCode: string,
    defaultErrorMessage: string,
    parserOrErrorCode?: ((input: string) => Type | undefined) | string,
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): ValidatorType {
    const nextParser = (input: unknown): ParseResult<Type> => {
      const stringParseResult = this.parse(input);
      if (!stringParseResult.success) {
        return stringParseResult;
      }

      const typedParser =
        typeof parserOrErrorCode === "function"
          ? parserOrErrorCode
          : defaultParser;

      const value = typedParser(stringParseResult.parsed);

      if (value !== undefined) {
        return {
          success: true,
          errors: [],
          parsed: value,
        };
      }

      let code =
        typeof parserOrErrorCode === "function"
          ? errorCodeOrErrorMessage
          : parserOrErrorCode;

      let message =
        typeof parserOrErrorCode === "function"
          ? errorMessage
          : errorCodeOrErrorMessage;

      if (code == null) {
        code = defaultErrorCode;
        message = defaultErrorMessage;
      } else {
        message = message ?? code;
      }

      return {
        success: false,
        errors: [
          {
            code,
            message,
            path: [],
          },
        ],
      };
    };

    return new ctor(nextParser);
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

function defaultStringParser(input: unknown): ParseResult<string> {
  return typeof input === "string"
    ? {
        success: true,
        errors: EmptyErrorArray as [],
        parsed: input,
      }
    : InvalidTypeParseResult;
}

function defaultURLParser(input: string): URL | undefined {
  try {
    return new URL(input);
  } catch (err) {
    return;
  }
}
