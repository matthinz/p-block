import { combineErrorLists, prepareContextToEnableThrowing } from "./errors";
import {
  PrepareValidationContextFunction,
  ValidationContext,
  ValidationErrorDetails,
  Validator,
} from "./types";
import { createTrackingContext } from "./utils";

export class AndValidator<Left, Right> implements Validator<Left & Right> {
  private readonly left: Validator<Left>;
  private readonly right: Validator<Right>;
  private readonly prepareContext?: PrepareValidationContextFunction;

  constructor(
    left: Validator<Left>,
    right: Validator<Right>,
    prepareContext?: PrepareValidationContextFunction
  ) {
    this.left = left;
    this.right = right;
    this.prepareContext = prepareContext;
  }

  shouldThrow(): AndValidator<Left, Right> {
    return new AndValidator(
      this.left,
      this.right,
      prepareContextToEnableThrowing
    );
  }

  validate(input: any, context?: ValidationContext): input is Left & Right {
    if (this.prepareContext) {
      context = this.prepareContext(context);
    }

    const leftErrors: ValidationErrorDetails[] = [];
    const leftIsValid = this.left.validate(
      input,
      createTrackingContext(leftErrors, context)
    );

    const rightErrors: ValidationErrorDetails[] = [];
    const rightIsValid = this.right.validate(
      input,
      createTrackingContext(rightErrors, context)
    );

    if (leftIsValid && rightIsValid) {
      return true;
    }

    return (
      context?.handleErrors(combineErrorLists(leftErrors, rightErrors)) ?? false
    );
  }
}
