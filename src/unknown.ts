import { Parser, ParseResult } from "./types";

/**
 * A Parser<unknown> implementation that just always successfully parses input.
 */
export const unknownParser: Parser<unknown> = {
  parse: (input: unknown): ParseResult<unknown> => ({
    success: true,
    errors: [],
    parsed: input,
  }),
};
