import { Parser, ParseResult } from "./types";
import { createInvalidTypeParseResult, NO_ERRORS } from "./utils";

const SUCCESS_RESULT: ParseResult<undefined> = Object.freeze({
  success: true,
  errors: NO_ERRORS,
  value: undefined,
});

const FAILURE_RESULT: ParseResult<undefined> = createInvalidTypeParseResult(
  "input must be null or undefined"
);

export const nullishParser: Parser<undefined> = {
  parse: (input: unknown): ParseResult<undefined> => {
    return input == null ? SUCCESS_RESULT : FAILURE_RESULT;
  },
};
