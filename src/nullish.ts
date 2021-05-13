import { Parser, ParseResult } from "./types";

const SUCCESS_RESULT: ParseResult<undefined> = {
  success: true,
  errors: [],
  parsed: undefined,
};

const FAILURE_RESULT: ParseResult<undefined> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be null or undefined",
      path: [],
    },
  ],
};

export const nullishParser: Parser<undefined> = {
  parse: (input: unknown): ParseResult<undefined> => {
    return input == null ? SUCCESS_RESULT : FAILURE_RESULT;
  },
};
