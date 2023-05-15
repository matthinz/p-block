import { FluentComparableParserImpl } from "./comparable";
import {
  FluentDateParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
} from "./types";
import {
  createFailedParseResult,
  createInvalidTypeParseResult,
  NO_ERRORS,
} from "./utils";

const INVALID_TYPE_PARSE_RESULT = createInvalidTypeParseResult<Date>(
  "input must be a Date"
);

const INVALID_DATE_PARSE_RESULT = createFailedParseResult<Date>(
  "invalidDate",
  "input must represent a valid Date"
);

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
      errors: NO_ERRORS,
      value: input,
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
