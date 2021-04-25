import { combineErrorLists, prepareContextToEnableThrowing } from "./errors";
import {
  PrepareValidationContextFunction,
  ValidationContext,
  ValidationErrorDetails,
  Validator,
} from "./types";
import { createTrackingContext, pathsEqual } from "./utils";

export class OrValidator<Left, Right> implements Validator<Left | Right> {
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

  TEMPORARY_validateAndThrow(
    input: any,
    context?: ValidationContext
  ): input is Left | Right {
    return this.validate(input, prepareContextToEnableThrowing(context));
  }

  validate(input: any, context?: ValidationContext): input is Left | Right {
    context = this.prepareContext ? this.prepareContext(context) : context;

    const leftErrors: ValidationErrorDetails[] = [];
    const leftIsValid = this.left.validate(
      input,
      createTrackingContext(leftErrors, context)
    );
    if (leftIsValid) {
      return true;
    }

    const rightErrors: ValidationErrorDetails[] = [];
    const rightIsValid = this.right.validate(
      input,
      createTrackingContext(rightErrors, context)
    );
    if (rightIsValid) {
      return true;
    }

    // For intersections on code + path, combine into a single error.
    const errors = combineErrorLists(leftErrors, rightErrors).reduce<
      ValidationErrorDetails[]
    >((result, err) => {
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

    return context?.handleErrors(errors) ?? false;
  }
}
