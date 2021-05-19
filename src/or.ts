import { Parser, ParseResult } from "./types";
import { combineErrorLists } from "./utils";

export class OrParser<Left, Right> implements Parser<Left | Right> {
  constructor(
    private readonly left: Parser<Left>,
    private readonly right: Parser<Right>
  ) {}

  parse(input: unknown): ParseResult<Left | Right> {
    const leftResult = this.left.parse(input);
    if (leftResult.success) {
      return leftResult;
    }

    const rightResult = this.right.parse(input);
    if (rightResult.success) {
      return rightResult;
    }

    const errors = combineErrorLists(
      [leftResult.errors, rightResult.errors],
      (x, y) => {
        if (x.message === y.message) {
          return x;
        }

        return {
          ...x,
          message: `${x.message} OR ${y.message}`,
        };
      }
    );

    return {
      success: false,
      errors,
    };
  }
}
