import { FluentComparableParserImpl } from "./comparable";
import {
  FluentDateParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
} from "./types";

const INVALID_TYPE_PARSE_RESULT: ParseResult<Date> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be a Date",
      path: [],
    },
  ],
};

const INVALID_DATE_PARSE_RESULT: ParseResult<Date> = {
  success: false,
  errors: [
    {
      code: "invalidDate",
      message: "input must represent a valid Date",
      path: [],
    },
  ],
};

export const defaultDateParser: Parser<Date> = {
  parse(input: unknown): ParseResult<Date> {
    if (input == null || !(input instanceof Date)) {
      return INVALID_TYPE_PARSE_RESULT;
    }

    // e.g. new Date("not a real date") yields a Date that is also NaN.
    if (isNaN(input.getTime())) {
      return INVALID_DATE_PARSE_RESULT;
    }

    return {
      success: true,
      errors: [],
      parsed: input,
    };
  },
};

export class FluentDateParserImpl
  extends FluentComparableParserImpl<Date, FluentDateParser>
  implements FluentDateParser {
  constructor(root: FluentParsingRoot, parser?: Parser<Date>) {
    super(root, parser ?? defaultDateParser, FluentDateParserImpl);
  }
}
