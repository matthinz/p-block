import { combineErrorLists } from "./errors";
import { ParseResult, Validator } from "./types";

export class AndValidator<Left, Right> implements Validator<Left & Right> {
  private readonly left: Validator<Left>;
  private readonly right: Validator<Right>;

  constructor(left: Validator<Left>, right: Validator<Right>) {
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

  validate(input: any): input is Left & Right {
    const { success } = this.parse(input);
    return success;
  }
}
