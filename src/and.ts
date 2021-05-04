import { combineErrorLists } from "./errors";
import { Parser, ParseResult } from "./types";

export class AndValidator<Left, Right> implements Parser<Left & Right> {
  private readonly left: Parser<Left>;
  private readonly right: Parser<Right>;

  constructor(left: Parser<Left>, right: Parser<Right>) {
    this.left = left;
    this.right = right;
  }

  parse(input: any): ParseResult<Left & Right> {
    const leftResult = this.left.parse(input);
    const rightResult = this.right.parse(input);

    if (leftResult.success && rightResult.success) {
      throw new Error("Not implemented");
    }

    return {
      success: false,
      errors: combineErrorLists(leftResult.errors, rightResult.errors),
    };
  }
}
