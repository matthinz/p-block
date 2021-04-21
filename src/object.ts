import { FluentArrayValidator } from "./array";
import { BasicValidator } from "./basic";
import { enableThrowing, ValidationError } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  ValidationContext,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorOptions,
} from "./types";

type ValidatorDictionary = { [property: string]: Validator<any> };

export interface FluentObjectValidator<Type extends {}>
  extends FluentValidator<Type> {
  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectValidator<Type>;

  /**
   * @returns A new validator, derived from this one, that throws errors on validation failures.
   */
  shouldThrow(): FluentObjectValidator<Type>;

  /**
   * @param properties
   * @returns A new validator, derived from this one, that verifies that all properties
   *          listed in `properties` are present and pass validation rules supplied.
   */
  withProperties<
    PropertyValidators extends {
      [property: string]: Validator<any>;
    }
  >(
    properties: PropertyValidators
  ): FluentObjectValidator<
    Type &
      {
        [property in keyof PropertyValidators]: typeof properties[property] extends Validator<
          infer T
        >
          ? T
          : never;
      }
  >;
}

function checkIsObject<Type extends {}>(
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

export class ObjectValidator<ParentType extends {}, Type extends ParentType>
  extends BasicValidator<ParentType, Type>
  implements FluentObjectValidator<Type> {
  constructor(
    parent?: ObjectValidator<any, ParentType>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validators?: ValidationFunction<Type> | ValidationFunction<Type>[],
    options?: ValidatorOptions
  ) {
    super(parent ?? checkIsObject, normalizers, validators, options);
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentObjectValidator<Type> {
    return new ObjectValidator(this, normalizers, [], this.options);
  }

  passes(
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectValidator<Type> {
    return new ObjectValidator(this, [], validators, {
      ...this.options,
      errorCode: errorCode ?? this.options.errorCode,
      errorMessage: errorMessage ?? this.options.errorMessage,
    });
  }

  shouldThrow(): FluentObjectValidator<Type> {
    return new ObjectValidator<Type, Type>(
      this,
      [],
      [],
      enableThrowing(this.options)
    );
  }

  /**
   * @param properties
   * @returns A new ObjectValidator that checks that all properties pass the provided validators.
   */
  withProperties<Properties extends ValidatorDictionary>(
    properties: Properties
  ): FluentObjectValidator<
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
          const propertyValue = (input as { [property: string]: any })[
            propertyName
          ];
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
