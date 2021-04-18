import { BasicValidator } from "./basic";
import {
  NormalizationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";

type ObjectWithProperties = {} & { [property: string]: any };

type ValidatorDictionary = { [property: string]: Validator<any> };

function checkIsObject<Type extends ObjectWithProperties>(
  input: any,
  context?: ValidationContext
): input is Type {
  if (typeof input === "object" && input != null && !Array.isArray(input)) {
    return true;
  }
  return (
    context?.handleErrors([
      { code: "invalidType", message: "input must be an object", path: [] },
    ]) ?? false
  );
}

export class ObjectValidator<
  ParentType extends ObjectWithProperties,
  Type extends ParentType
> extends BasicValidator<ParentType, Type> {
  constructor(
    parent: ObjectValidator<any, ParentType> | undefined,
    normalizers: NormalizationFunction<Type> | NormalizationFunction<Type>[],
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? checkIsObject, normalizers, validators, options);
  }

  /**
   *
   * @param properties
   * @returns A new ObjectValidator that checks that all properties pass the provided validators.
   */
  withProperties<Properties extends ValidatorDictionary>(
    properties: Properties
  ): ObjectValidator<
    Type,
    Type &
      {
        [property in keyof Properties]: typeof properties[property] extends Validator<
          infer T
        >
          ? T
          : never;
      }
  > {
    type NextType = Type &
      {
        [property in keyof Properties]: typeof properties[property] extends Validator<
          infer T
        >
          ? T
          : never;
      };

    function validateObjectProperties(
      input: Type,
      context?: ValidationContext
    ): input is NextType {
      const errorsByProperty: {
        [property: string]: ValidationErrorDetails[] | undefined;
      } = {};

      const result = Object.keys(properties).reduce<boolean>(
        (allPropertiesValid, propertyName) => {
          const propertyValue = input[propertyName];
          const propertyValidator = properties[propertyName];
          const propertyContext = {
            ...(context ?? { handleError: () => false }),
            path: [...(context?.path ?? []), propertyName],
          };

          const isValid = propertyValidator.validate(propertyValue, {
            ...propertyContext,

            // Capture errors during property validation.
            // (We'll clean them up and augment them with metadata below)
            handleErrors(errors: ValidationErrorDetails[]) {
              // SPECIAL CASE: When the value of the property is `undefined`,
              //               we interpret an `invalidType` validation failure
              //               here as meaning "this property is required"
              const isRequiredError =
                propertyValue === undefined &&
                errors.length === 1 &&
                errors[0].code === "invalidType";

              if (isRequiredError) {
                errors = [
                  {
                    code: "required",
                    message: `input must include property '${propertyName}'`,
                    path: [],
                  },
                ];
              }

              if (errors.length > 0) {
                errorsByProperty[propertyName] = errors;
              }

              return false;
            },
          });

          if (isValid) {
            return allPropertiesValid;
          }

          return false;
        },
        true
      );

      if (result === true) {
        return true;
      }

      return (
        context?.handleErrors(
          Object.keys(errorsByProperty)
            .map((propertyName) => {
              const errors = errorsByProperty[propertyName];
              return (errors ?? []).map((error) => ({
                ...error,
                path: [...(context?.path ?? []), propertyName],
              }));
            })
            .reduce<ValidationErrorDetails[]>(
              (result, errors) => [...result, ...errors],
              []
            )
        ) ?? false
      );
    }

    return new ObjectValidator<Type, NextType>(
      this,
      [],
      validateObjectProperties,
      this.options
    );
  }
}
