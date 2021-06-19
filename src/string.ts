import { FluentParserImpl } from "./base";
import { FluentBooleanParserImpl } from "./boolean";
import { FluentDateParserImpl } from "./date";
import { FluentNumberParserImpl } from "./number";
import {
  FluentBooleanParser,
  FluentDateParser,
  FluentNumberParser,
  FluentParsingRoot,
  FluentStringParser,
  FluentURLParser,
  Parser,
  ParseResult,
} from "./types";
import { FluentURLParserImpl } from "./url";
import { resolveErrorDetails } from "./utils";

const INVALID_TYPE_PARSE_RESULT: ParseResult<string> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be of type 'string'",
      path: [],
    },
  ],
};

const defaultStringParser: Parser<string> = {
  parse(input: unknown): ParseResult<string> {
    if (typeof input !== "string") {
      return INVALID_TYPE_PARSE_RESULT;
    }
    return {
      success: true,
      errors: [],
      value: input,
    };
  },
};

export class FluentStringParserImpl
  extends FluentParserImpl<string, FluentStringParser>
  implements FluentStringParser {
  constructor(root: FluentParsingRoot, parser?: Parser<string>) {
    super(root, parser ?? defaultStringParser, FluentStringParserImpl);
  }

  isIn(
    values: string[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser {
    return this.passes(
      (input) => values.includes(input),
      errorCode,
      errorMessage
    );
  }

  length(length: number): FluentStringParser {
    return this.passes(
      (str) => str.length === length,
      "length",
      `input length must be equal to ${length} character(s)`
    );
  }

  lowerCased(): FluentStringParser {
    return this.normalizedWith((value: string) => value.toLowerCase());
  }

  matches(
    regex: RegExp,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser {
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
  ): FluentStringParser {
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
  ): FluentStringParser {
    [errorCode, errorMessage] = resolveErrorDetails(
      "minLength",
      `input length must be greater than or equal to ${min} character(s)`,
      errorCode,
      errorMessage
    );

    return this.passes((input) => input.length >= min, errorCode, errorMessage);
  }

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringParser {
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
  ): FluentBooleanParser {
    return this.internalParsedAs(
      FluentBooleanParserImpl,
      defaultStringToBooleanParser,
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
  ): FluentDateParser {
    return this.internalParsedAs(
      FluentDateParserImpl,
      defaultStringToDateParser,
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
  ): FluentNumberParser {
    return this.internalParsedAs(
      FluentNumberParserImpl,
      defaultStringToFloatParser,
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
  ): FluentNumberParser {
    if (typeof radixOrParserOrErrorCode === "number") {
      if (radixOrParserOrErrorCode < 2 || radixOrParserOrErrorCode > 36) {
        throw new Error("radix must be between 2 and 36, inclusive");
      }
      radixOrParserOrErrorCode = defaultStringToIntegerParser.bind(
        undefined,
        radixOrParserOrErrorCode
      );
    }

    return this.internalParsedAs(
      FluentNumberParserImpl,
      defaultStringToIntegerParser.bind(undefined, 10),
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
  ): FluentURLParser {
    return this.internalParsedAs<URL, FluentURLParser>(
      FluentURLParserImpl,
      defaultStringToURLParser,
      "parsedAsURL",
      "input cannot be parsed as a URL",
      parserOrErrorCode,
      errorCodeOrErrorMessage,
      errorMessage
    );
  }

  trimmed(): FluentStringParser {
    return this.normalizedWith((str) => str.trim());
  }

  upperCased(): FluentStringParser {
    return this.normalizedWith((str) => str.toUpperCase());
  }
}

function defaultStringToBooleanParser(input: string): boolean | undefined {
  const TRUE_REGEX = /^(y|Y|yes|Yes|YES|true|True|TRUE|on|On|ON)$/;
  const FALSE_REGEX = /^(n|N|no|No|NO|false|False|FALSE|off|Off|OFF)$/;

  if (TRUE_REGEX.test(input)) {
    return true;
  }

  if (FALSE_REGEX.test(input)) {
    return false;
  }
}

function defaultStringToDateParser(input: string): Date | undefined {
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

function defaultStringToIntegerParser(
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

function defaultStringToFloatParser(input: string): number | undefined {
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

function defaultStringToURLParser(input: string): URL | undefined {
  try {
    return new URL(input);
  } catch (err) {
    return;
  }
}
