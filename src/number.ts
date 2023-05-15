import { FluentComparableParserImpl } from "./comparable";
import {
  FluentNumberParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
} from "./types";
import {
  createFailedParseResult,
  createInvalidTypeParseResult,
  NO_ERRORS,
} from "./utils";

const INVALID_TYPE_PARSE_RESULT = createInvalidTypeParseResult<number>(
  "input must be of type 'number'"
);

const NOT_FINITE_PARSE_RESULT = createFailedParseResult<number>(
  "invalidNumber",
  "input must be a finite number"
);

export const finiteNumberParser: Parser<number> = {
  parse(input: unknown): ParseResult<number> {
    if (typeof input !== "number") {
      return INVALID_TYPE_PARSE_RESULT;
    }

    if (!isFinite(input)) {
      return NOT_FINITE_PARSE_RESULT;
    }

    return {
      success: true,
      errors: NO_ERRORS,
      value: input,
    };
  },
};

export class FluentNumberParserImpl
  extends FluentComparableParserImpl<number, FluentNumberParser>
  implements FluentNumberParser {
  constructor(root: FluentParsingRoot, parser?: Parser<number>) {
    super(root, parser ?? finiteNumberParser, FluentNumberParserImpl);
  }

  roundedTo(decimalPlaces = 0): FluentNumberParser {
    return this.normalizedWith((input: number) => {
      const exp = Math.pow(10, decimalPlaces);
      return Math.round(input * exp) / exp;
    });
  }

  truncated(): FluentNumberParser {
    return this.normalizedWith((input: number) => Math.floor(input));
  }
}
