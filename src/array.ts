import { BasicValidator } from "./basic";
import { enableThrowing } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";

export interface FluentArrayValidator<ItemType>
  extends FluentValidator<ItemType[]> {
  allItemsPass(
    validator: ValidationFunction<ItemType>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  minLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentArrayValidator<ItemType>;

  /**
   * @returns A new Array validator, derived from this one, that runs a further type check on its items.
   */
  of<NextItemType extends ItemType>(
    validator: Validator<NextItemType>
  ): FluentArrayValidator<NextItemType>;

  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators:
      | ValidationFunction<ItemType[]>
      | ValidationFunction<ItemType[]>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  /**
   * @returns A new FluentArrayValidator, configured to throw exceptions.
   */
  shouldThrow(): FluentArrayValidator<ItemType>;
}

function defaultArrayValidator<ItemType>(
  input: any,
  context?: ValidationContext
): input is ItemType[] {
  if (Array.isArray(input)) {
    return true;
  }
  return (
    context?.handleErrors([
      {
        code: "invalidType",
        message: "input must be an array",
        path: [],
      },
    ]) ?? false
  );
}

export class ArrayValidator<ParentItemType, ItemType extends ParentItemType>
  extends BasicValidator<ParentItemType[], ItemType[]>
  implements FluentArrayValidator<ItemType> {
  constructor(
    parent?: ArrayValidator<any, ParentItemType>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?:
      | ValidationFunction<ItemType[]>
      | ValidationFunction<ItemType[]>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? defaultArrayValidator, normalizers, validators, options);
  }

  allItemsPass(
    validator: ValidationFunction<ItemType>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return new ArrayValidator(
      this,
      [],
      [
        createArrayItemValidator(
          [validator],
          errorCode ?? "allItemsPass",
          errorMessage ?? "all items in input array must pass the check"
        ),
      ],
      this.options
    );
  }

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return this.passes(
      (input) => input.length <= value,
      errorCode ?? "maxLength",
      errorMessage ?? `input must be an array of no more than ${value} item(s)`
    );
  }

  minLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return this.passes(
      (input) => input.length >= value,
      errorCode ?? "minLength",
      errorMessage ?? `input must be an array of at least ${value} item(s)`
    );
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentArrayValidator<ItemType> {
    return new ArrayValidator(this, normalizers, [], this.options);
  }

  of<NextItemType extends ItemType>(
    validator: Validator<NextItemType>
  ): FluentArrayValidator<NextItemType> {
    return new ArrayValidator<ItemType, NextItemType>(
      this,
      [],
      createArrayItemValidator([validator]),
      this.options
    );
  }

  passes(
    validators:
      | ValidationFunction<ItemType[]>
      | ValidationFunction<ItemType[]>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return new ArrayValidator<ItemType, ItemType>(
      this,
      [],
      Array.isArray(validators) ? validators : [validators],
      {
        ...this.options,
        ...{
          errorCode: errorCode ?? this.options?.errorCode,
          errorMessage: errorMessage ?? this.options?.errorMessage,
        },
      }
    );
  }

  shouldThrow(): FluentArrayValidator<ItemType> {
    return new ArrayValidator(this, [], [], enableThrowing(this.options));
  }
}

function createArrayItemValidator<ItemType>(
  validators: (ValidationFunction<ItemType> | Validator<ItemType>)[],
  errorCode?: string,
  errorMessage?: string
): (input: ItemType[], context?: ValidationContext) => boolean {
  return function validateArrayItems(
    input: ItemType[],
    context?: ValidationContext
  ): boolean {
    let isValid = true;

    let itemErrors: ValidationErrorDetails[] = [];

    // This flag will allow us to keep track of whether
    // custom validation code is properly calling .handleErrors()
    let handleErrorsCalled = false;

    const itemContext: ValidationContext = {
      ...context,
      handleErrors(errors: ValidationErrorDetails[]): false {
        handleErrorsCalled = true;
        itemErrors = [
          ...itemErrors,
          ...errors.map(({ code, message }) => ({
            code: errorCode ?? code,
            message: errorMessage ?? message,
            path: [...itemContext.path],
          })),
        ];
        return false;
      },
      path: [...(context?.path ?? []), 0],
    };

    input.forEach((item, index) => {
      itemContext.path[itemContext.path.length - 1] = index;

      const isItemValid = validators.every((validator) => {
        handleErrorsCalled = false;

        if (typeof validator === "function") {
          // If the ValidationFunction does not call handleErrors() on failure,
          // report errors on its behalf.
          if (validator(item, itemContext)) {
            return true;
          }

          if (!handleErrorsCalled) {
            // Assume the function doesn't know about ValidationContext,
            // and report its errors for it.

            if (errorCode !== undefined) {
              return itemContext.handleErrors([
                {
                  code: errorCode,
                  message: errorMessage ?? errorCode,
                  path: itemContext.path,
                },
              ]);
            }
          }

          return false;
        }

        if (validator.validate(item, itemContext)) {
          return true;
        }

        if (!handleErrorsCalled) {
          // If a Validator<T> does not call handleErrors, that should be
          // regarded as a bug.
          throw new Error(
            "Validator did not call handleErrors() on validation failure. This is probably a bug."
          );
        }

        return false;
      });

      isValid = isValid && isItemValid;
    });

    if (isValid) {
      return true;
    }

    return context?.handleErrors(itemErrors) ?? false;
  };
}
