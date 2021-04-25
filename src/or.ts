import { combineErrorLists } from "./errors";
import { ParseResult, ValidationErrorDetails, Validator } from "./types";
import { pathsEqual } from "./utils";

export class OrValidator<Left, Right> implements Validator<Left | Right> {
  private readonly left: Validator<Left>;
  private readonly right: Validator<Right>;

  constructor(left: Validator<Left>, right: Validator<Right>) {
    this.left = left;
    this.right = right;
  }

  parse(input: any): ParseResult<Left | Right> {
    const leftResult = this.left.parse(input);
    if (leftResult.success) {
      return leftResult;
    }

    const rightResult = this.right.parse(input);
    if (rightResult.success) {
      return rightResult;
    }

    // For intersections on code + path, combine into a single error.
    const errors = combineErrorLists(
      leftResult.errors,
      rightResult.errors
    ).reduce<ValidationErrorDetails[]>((result, err) => {
      const existing = result.find(
        (e) => e.code === err.code && pathsEqual(e.path, err.path)
      );

      if (existing) {
        existing.message = `${existing.message} OR ${err.message}`;
      } else {
        result.push(err);
      }

      return result;
    }, []);

    return {
      success: false,
      errors,
    };
  }

  TEMPORARY_validateAndThrow(input: any): input is Left | Right {
    return this.validate(input);
  }

  validate(input: any): input is Left | Right {
    const { success } = this.parse(input);
    return success;
  }
}
