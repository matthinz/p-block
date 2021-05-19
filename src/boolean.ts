import { FluentParserImpl } from "./base";
import {
  FluentBooleanParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
} from "./types";

const INVALID_TYPE_PARSE_RESULT: ParseResult<boolean> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be of type 'boolean'",
      path: [],
    },
  ],
};

export const defaultBooleanParser: Parser<boolean> = {
  parse(input: unknown): ParseResult<boolean> {
    if (typeof input === "boolean") {
      return {
        success: true,
        errors: [],
        value: input,
      };
    }

    return INVALID_TYPE_PARSE_RESULT;
  },
};

export class FluentBooleanParserImpl
  extends FluentParserImpl<boolean, FluentBooleanParser>
  implements FluentBooleanParser {
  constructor(root: FluentParsingRoot, parser?: Parser<boolean>) {
    super(root, parser ?? defaultBooleanParser, FluentBooleanParserImpl);
  }

  defaultedTo(value: boolean): FluentBooleanParser {
    return super.defaultedTo(value);
  }

  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanParser {
    return this.passes(
      (value) => !value,
      errorCode ?? "isFalse",
      errorMessage ?? "input must be false"
    );
  }

  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanParser {
    return this.passes(
      (value) => value,
      errorCode ?? "isTrue",
      errorMessage ?? "input must be true"
    );
  }
}
