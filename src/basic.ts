import { V } from ".";
import { ValidationError } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  Normalizer,
  TypeValidationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";

const defaultOptions: ValidatorOptions = {
  errorCode: "invalid",
  errorMessage: "input was invalid",
};

function throwValidationError(
  this: ValidationContext,
  errors: ValidationErrorDetails[]
): false {
  throw new ValidationError(errors);
}

function createTypeValidator<Type>(
  type: string
): TypeValidationFunction<any, Type> {
  return function validateType(
    input: any,
    context?: ValidationContext
  ): input is Type {
    if (typeof input === type) {
      return true;
    }

    if (context) {
      return context.handleErrors([
        {
          code: "invalidType",
          message: `input must be of type '${type}'`,
          path: [],
        },
      ]);
    }

    return false;
  };
}

/**
 * Validator that asserts an input is of a a specific type.
 */
export class BasicValidator<ParentType, Type extends ParentType>
  implements FluentValidator<Type> {
  private parent?:
    | BasicValidator<any, ParentType>
    | TypeValidationFunction<any, Type>;
  private normalizers: NormalizationFunction<Type>[];
  private validators: ValidationFunction<Type>[];
  protected options: ValidatorOptions;

  constructor(
    parent:
      | BasicValidator<any, ParentType>
      | TypeValidationFunction<any, Type>
      | string,
    normalizers: NormalizationFunction<Type> | NormalizationFunction<Type>[],
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    options?: ValidatorOptions
  ) {
    this.parent =
      typeof parent === "string" ? createTypeValidator<Type>(parent) : parent;
    this.normalizers = Array.isArray(normalizers) ? normalizers : [normalizers];
    this.validators = Array.isArray(validators) ? validators : [validators];
    this.options =
      options == null
        ? defaultOptions
        : {
            ...defaultOptions,
            ...options,
          };
  }

  and<OtherType>(
    validator: Validator<OtherType>
  ): FluentValidator<Type & OtherType> {
    throw new Error();
  }

  /**
   * @param normalizer
   */
  normalizedWith(
    ...normalizers: NormalizationFunction<Type>[]
  ): BasicValidator<Type, Type> {
    return new BasicValidator<Type, Type>(this, normalizers, []);
  }

  /**
   * Given a strongly-typed input, applies all configured normalizations.
   * @param input
   * @returns Normalized version of `input`.
   */
  normalize(input: Type): Type {
    if (this.parent instanceof BasicValidator) {
      // XXX: You can probably get into some hairy situations here.
      input = this.parent.normalize(input as ParentType) as Type;
    }

    return this.normalizers.reduce(
      (result, normalizer) => normalizer(result),
      input
    );
  }

  /**
   * @returns A validator that will check for `undefined` or the configured type.
   */
  optional(): FluentValidator<Type | undefined> {
    throw new Error();
  }

  or<OtherType>(
    validator: Validator<OtherType>
  ): FluentValidator<Type | OtherType> {
    throw new Error();
  }

  /**
   * @returns A new BasicValidator that performs an additional check on its input beyond a basic type check.
   */
  passes(
    validator: ValidationFunction<Type>,
    errorCode: string = "invalid",
    errorMessage: string = "input was invalid"
  ): BasicValidator<Type, Type> {
    return new BasicValidator(this, [], [validator], {
      ...this.options,
      errorCode,
      errorMessage,
    });
  }

  /**
   * @returns A new Validator configured to throw on validation errors.
   */
  shouldThrow(): BasicValidator<Type, Type> {
    return new BasicValidator<Type, Type>(this, [], [], {
      ...this.options,
      prepareContext: (
        context?: ValidationContext
      ): ValidationContext | undefined => {
        context = this.options.prepareContext
          ? this.options.prepareContext(context)
          : context;

        return {
          ...(context ?? { path: [] }),
          handleErrors: throwValidationError,
        };
      },
    });
  }

  toString() {
    return this.validators.map((validator) => validator.toString()).join(", ");
  }

  /**
   * @returns true if `input` is `Type`.
   */
  validate(input: any, context?: ValidationContext): input is Type {
    context = this.options.prepareContext
      ? this.options.prepareContext(context)
      : context;

    const { parent } = this;

    if (parent instanceof BasicValidator) {
      if (!parent.validate(input, context)) {
        return false;
      }
    } else if (typeof parent === "function") {
      if (!parent(input, context)) {
        return false;
      }
    } else {
      throw new Error("parent was not a BasicValidator or a function");
    }

    // XXX: normalizedWith guarantees that the child validator will have the same
    //      type as the parent validator, so this is ok. Would be nice to
    //      re-work so we could avoid the use of `as` here.
    input = this.normalize(input as Type);

    let allErrors: ValidationErrorDetails[] = [];

    const recordingContext = {
      ...(context ?? { path: [] }),
      handleErrors(errors: ValidationErrorDetails[]): false {
        if (errors.length > 0) {
          allErrors = [...allErrors, ...errors];
        }
        return false;
      },
    };

    const passesChecks = this.validators.reduce<boolean>(
      (isValid, validator) => isValid && validator(input, recordingContext),
      true
    );

    if (passesChecks) {
      return true;
    }

    if (context) {
      return context.handleErrors(
        allErrors.length > 0
          ? allErrors
          : [
              {
                code: this.options.errorCode,
                message: this.options.errorMessage,
                path: [],
              },
            ]
      );
    }

    return false;
  }
}
