import { BasicValidator } from "./basic";
import {
  FluentValidator,
  NormalizationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";
import { composeValidators } from "./utils";

type ValidatorDictionary = {
  [property: string]: Validator<any>;
};

export interface FluentObjectValidator<Type extends Record<string, unknown>>
  extends FluentValidator<Type> {
  defaultedTo<Defaults extends { [property in keyof Type]?: Type[property] }>(
    values: Defaults
  ): FluentObjectValidator<Type>;

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

function isObject<Type extends Record<string, unknown>>(
  input: any,
  errors?: ValidationErrorDetails[]
): input is Type {
  if (typeof input === "object" && input != null && !Array.isArray(input)) {
    return true;
  }

  errors?.push({
    code: "invalidType",
    message: "input must be an object",
    path: [],
  });
  return false;
}

export class ObjectValidator<
    ParentType extends Record<string, unknown>,
    Type extends ParentType
  >
  extends BasicValidator<Type>
  implements FluentObjectValidator<Type> {
  constructor(
    parent?: ObjectValidator<any, ParentType>,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<Type> | Validator<Type>
  ) {
    super(
      (input: any, errors?: ValidationErrorDetails[]): input is Type => {
        if (parent) {
          const parsed = parent.parse(input);
          if (!parsed.success) {
            errors?.push(...parsed.errors);
            return false;
          }
          return true;
        }

        return isObject(input, errors);
      },
      normalizers,
      validator
    );
  }

  defaultedTo<Defaults extends { [property in keyof Type]?: Type[property] }>(
    defaults: Defaults
  ): FluentObjectValidator<Type> {
    return this.normalizedWith((input) => {
      if (input == null || typeof input !== "object") {
        return input;
      }

      const result: Record<string, unknown> = {};

      const keys = [...Object.keys(defaults), ...Object.keys(input)];

      keys.forEach((key) => {
        result[key] = input[key] ?? defaults[key];
      });

      return result;
    });
  }

  normalizedWith(
    normalizers: NormalizationFunction | NormalizationFunction[]
  ): FluentObjectValidator<Type> {
    return new ObjectValidator(this, normalizers);
  }

  passes(
    validators:
      | ValidationFunction<Type>
      | Validator<Type>
      | (ValidationFunction<Type> | Validator<Type>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectValidator<Type> {
    return new ObjectValidator(
      this,
      [],
      composeValidators(validators, errorCode, errorMessage)
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
      input: Type
    ): true | ValidationErrorDetails[] {
      const errors = Object.keys(properties).reduce<ValidationErrorDetails[]>(
        (errors, propertyName) => {
          const propertyValue = (input as Record<string, unknown>)[
            propertyName
          ];
          const propertyValidator = properties[propertyName];
          const propertyResult = propertyValidator.parse(propertyValue);

          if (propertyResult.success) {
            return errors;
          }

          if (propertyResult.errors.length === 0) {
            throw new Error("Validator cannot return empty error array");
          }

          if (
            propertyValue === undefined &&
            propertyResult.errors.length === 1 &&
            propertyResult.errors[0].code === "invalidType"
          ) {
            errors.push({
              code: "required",
              message: `input must include property '${propertyName}'`,
              path: [...propertyResult.errors[0].path, propertyName],
            });
          } else {
            errors.push(
              ...propertyResult.errors.map((e) => ({
                ...e,
                path: [propertyName, ...e.path],
              }))
            );
          }

          return errors;
        },
        []
      );

      return errors.length === 0 || errors;
    }

    return new ObjectValidator<Type, NextType>(
      this,
      [],
      validateObjectProperties
    );
  }
}
