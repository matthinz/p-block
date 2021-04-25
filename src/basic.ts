import { enableThrowing, prepareContextToEnableThrowing } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";
import { createTrackingContext } from "./utils";

const defaultOptions: ValidatorOptions = {
  errorCode: "invalid",
  errorMessage: "input was invalid",
};

function createTypeValidator<Type>(
  type: string,
  options?: ValidatorOptions
): TypeValidationFunction<any, Type> {
  return function validateType(
    input: any,
    context?: ValidationContext
  ): input is Type {
    if (typeof input === type) {
      return true;
    }

    let errorCode: string;
    let errorMessage: string | ((input: any) => string);

    if (options?.errorCode) {
      errorCode = options.errorCode;
      errorMessage = options.errorMessage ?? errorCode;
    } else {
      errorCode = "invalidType";
      errorMessage = `input must be of type '${type}'`;
    }

    if (context) {
      return context.handleErrors([
        {
          code: errorCode,
          message:
            typeof errorMessage === "function"
              ? errorMessage(input)
              : errorMessage,
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
export abstract class BasicValidator<ParentType, Type extends ParentType> {
  private readonly parent?:
    | BasicValidator<any, ParentType>
    | TypeValidationFunction<any, Type>;
  private readonly normalizers: NormalizationFunction[];
  private readonly validators: (ValidationFunction<Type> | Validator<Type>)[];
  protected readonly options: ValidatorOptions;

  constructor(
    parent:
      | BasicValidator<any, ParentType>
      | TypeValidationFunction<any, Type>
      | string,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?:
      | ValidationFunction<Type>
      | Validator<Type>
      | (ValidationFunction<Type> | Validator<Type>)[],
    options?: ValidatorOptions
  ) {
    this.parent =
      typeof parent === "string"
        ? createTypeValidator<Type>(parent, options)
        : parent;
    this.normalizers = normalizers
      ? Array.isArray(normalizers)
        ? normalizers
        : [normalizers]
      : [];
    this.validators = validators
      ? Array.isArray(validators)
        ? validators
        : [validators]
      : [];
    this.options =
      options == null
        ? defaultOptions
        : {
            ...defaultOptions,
            ...options,
          };
  }

  /**
   * Given an, applies all configured normalizations.
   * @param input
   * @returns Normalized version of `input`.
   */
  normalize(input: any): any {
    if (this.parent instanceof BasicValidator) {
      input = this.parent.normalize(input);
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

  toString(): string {
    return this.validators.map((validator) => validator.toString()).join(", ");
  }

  TEMPORARY_validateAndThrow(
    input: any,
    context?: ValidationContext
  ): input is Type {
    return this.validate(input, prepareContextToEnableThrowing(context));
  }

  /**
   * @returns true if `input` is `Type`.
   */
  validate(input: any, context?: ValidationContext): input is Type {
    context = this.options.prepareContext
      ? this.options.prepareContext(context)
      : context;

    input = this.normalize(input);

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

    const allErrors: ValidationErrorDetails[] = [];

    const passesValidators = this.validators.reduce<boolean>(
      (isValid, validator) => {
        if (!isValid) {
          return false;
        }

        const validatorErrors: ValidationErrorDetails[] = [];
        const trackingContext = createTrackingContext(validatorErrors, context);

        const validatorPasses =
          typeof validator === "function"
            ? validator(input, trackingContext)
            : validator.validate(input, trackingContext);

        allErrors.push(...validatorErrors);

        return validatorPasses;
      },
      true
    );

    if (passesValidators) {
      return true;
    }

    if (context) {
      return context.handleErrors(
        allErrors.length > 0
          ? allErrors
          : [
              {
                code: this.options.errorCode,
                message:
                  typeof this.options.errorMessage === "function"
                    ? this.options.errorMessage(input)
                    : this.options.errorMessage,
                path: [],
              },
            ]
      );
    }

    return false;
  }
}
