import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  TypeValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";
import { composeValidators } from "./utils";

export interface FluentArrayValidator<ItemType>
  extends FluentValidator<ItemType[]> {
  allItemsPass(
    validator: ValidationFunction<ItemType> | Validator<ItemType>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  defaultedTo(value: ItemType[]): FluentArrayValidator<ItemType>;

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
}

export class ArrayValidator<ItemType>
  extends BasicValidator<ItemType[]>
  implements FluentArrayValidator<ItemType> {
  constructor(
    parent?: ArrayValidator<ItemType> | TypeValidationFunction<any, ItemType[]>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<ItemType[]> | Validator<ItemType[]>
  ) {
    super(parent ?? isArray, normalizers, validator);
  }

  defaultedTo(value: ItemType[]): FluentArrayValidator<ItemType> {
    return this.normalizedWith((input) => input ?? value);
  }

  allItemsPass(
    validator: ValidationFunction<ItemType> | Validator<ItemType>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    [errorCode, errorMessage] = resolveErrorDetails(
      "allItemsPass",
      "all items in input array must pass the check",
      errorCode,
      errorMessage
    );

    return new ArrayValidator(
      this,
      [],
      createArrayItemValidator([validator], errorCode, errorMessage)
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
    return new ArrayValidator(this, normalizers);
  }

  of<NextItemType extends ItemType>(
    validator:
      | TypeValidationFunction<ItemType, NextItemType>
      | Validator<NextItemType>
  ): FluentArrayValidator<NextItemType> {
    const parentValidator = (
      input: any,
      errors?: ValidationErrorDetails[]
    ): input is NextItemType[] => {
      const parsed = this.parse(input);
      if (!parsed.success) {
        errors?.push(...parsed.errors);
        return false;
      }

      return parsed.parsed.reduce<boolean>((allValid, item, index) => {
        if (typeof validator === "function") {
          const itemErrors: ValidationErrorDetails[] = [];
          if (!validator(item, itemErrors)) {
            errors?.push(
              ...itemErrors.map((e: ValidationErrorDetails) => ({
                ...e,
                path: [...e.path, index],
              }))
            );
            return false;
          }
          return true;
        }

        const itemParse = validator.parse(item);
        if (!itemParse.success) {
          errors?.push(
            ...itemParse.errors.map((e: ValidationErrorDetails) => ({
              ...e,
              path: [...e.path, index],
            }))
          );
          return false;
        }

        return allValid;
      }, true);
    };

    return new ArrayValidator<NextItemType>(
      parentValidator,
      [],
      createArrayItemValidator([validator])
    );
  }

  passes(
    validators:
      | ValidationFunction<ItemType[]>
      | Validator<ItemType[]>
      | (ValidationFunction<ItemType[]> | Validator<ItemType[]>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return new ArrayValidator<ItemType>(
      this,
      [],
      composeValidators(validators, errorCode, errorMessage)
    );
  }
}

function isArray(
  input: any,
  errors?: ValidationErrorDetails[]
): input is any[] {
  if (!Array.isArray(input)) {
    errors?.push({
      code: "invalidType",
      message: "input must be an array",
      path: [],
    });
    return false;
  }
  return true;
}

function createArrayItemValidator<ItemType>(
  validators: (ValidationFunction<ItemType> | Validator<ItemType>)[],
  errorCode?: string,
  errorMessage?: string
): (input: ItemType[]) => true | ValidationErrorDetails[] {
  return function validateArrayItems(
    input: ItemType[]
  ): true | ValidationErrorDetails[] {
    const errors = input.reduce<ValidationErrorDetails[]>(
      (result, item, index) => {
        validators.every((validator) => {
          if (typeof validator === "function") {
            const validationResult = validator(item);
            if (validationResult === false) {
              if (errorCode === undefined) {
                throw new Error("Error code not specified");
              }
              result.push({
                code: errorCode,
                message: errorMessage ?? errorCode,
                path: [index],
              });
            } else if (Array.isArray(validationResult)) {
              if (validationResult.length === 0) {
                throw new Error("Returning an empty array is not supported");
              }
              result.push(
                ...validationResult.map((e) => ({
                  ...e,
                  path: [...e.path, index],
                }))
              );
            } else if (validationResult !== true) {
              errors.push({
                ...validationResult,
                path: [...validationResult.path, index],
              });
            }
          }
        });
        return result;
      },
      []
    );

    return errors.length === 0 || errors;
  };
}
