import { Parser, ParseResult } from "./types";
import { NO_ERRORS } from "./utils";

/**
 * A Parser<unknown> implementation that just always successfully parses input.
 */
export const unknownParser: Parser<unknown> = {
  parse: (input: unknown): ParseResult<unknown> => ({
    success: true,
    errors: NO_ERRORS,
    value: input,
  }),
};
