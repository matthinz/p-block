import { FluentComparableParserImpl } from "./comparable";
import {
  FluentNumberParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
} from "./types";

const INVALID_TYPE_PARSE_RESULT: ParseResult<number> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be of type 'number'",
      path: [],
    },
  ],
};

const NOT_FINITE_PARSE_RESULT: ParseResult<number> = {
  success: false,
  errors: [
    {
      code: "invalidNumber",
      message: "input must be a finite number",
      path: [],
    },
  ],
};

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
      errors: [],
      parsed: input,
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
