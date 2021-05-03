import { BasicValidator } from "./basic";
import {
  FluentValidator,
  NormalizationFunction,
  Parser,
  ParseResult,
  ParsingFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";

type ValidatorDictionary = {
  [property: string]: Validator<unknown>;
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

export class ObjectValidator<
    ParentType extends Record<string, unknown>,
    Type extends ParentType
  >
  extends BasicValidator<Type, FluentObjectValidator<Type>>
  implements FluentObjectValidator<Type> {
  constructor(
    parser: ParsingFunction<Type>,
    normalizer?: NormalizationFunction<Type>,
    validator?: ValidationFunction<Type>
  ) {
    super(ObjectValidator, parser, normalizer, validator);
  }

  defaultedTo<Defaults extends { [property in keyof Type]?: Type[property] }>(
    defaults: Defaults
  ): FluentObjectValidator<Type> {
    const nextParser = (input: unknown): ParseResult<Type> => {
      if (input == null) {
        input = { ...defaults };
      } else {
        const parsed = defaultObjectParser(input);
        if (parsed.success) {
          input = [
            ...Object.keys(defaults),
            ...Object.keys(parsed.parsed),
          ].reduce((obj, key) => {
            return { ...obj, [key]: parsed.parsed[key] ?? defaults[key] };
          }, {});
        }
      }

      return this.parse(input);
    };

    return this.derive(nextParser, this.normalizer, this.validator);
  }

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

    const nextParser = (input: unknown): ParseResult<NextType> => {
      const prevParseResult = this.parse(input);
      if (!prevParseResult.success) {
        return prevParseResult;
      }

      const errors = Object.keys(properties).reduce<ValidationErrorDetails[]>(
        (errors, propertyName) => {
          const propertyValue = prevParseResult.parsed[propertyName];
          const propertyValidator = properties[propertyName];
          const propertyResult = propertyValidator.parse(propertyValue);

          if (propertyResult.success) {
            return errors;
          }

          if (propertyResult.errors.length === 0) {
            throw new Error("Failed parse() cannot return empty error array");
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

      if (errors.length === 0) {
        return {
          success: true,
          errors: [],
          parsed: prevParseResult.parsed as NextType,
        };
      }

      return {
        success: false,
        errors,
      };
    };

    return new ObjectValidator<Type, NextType>(nextParser);
  }
}

export function defaultObjectParser(
  input: unknown
): ParseResult<Record<string, unknown>> {
  if (typeof input !== "object" || input == null || Array.isArray(input)) {
    return {
      success: false,
      errors: [
        {
          code: "invalidType",
          message: "input must be an object",
          path: [],
        },
      ],
    };
  }

  return {
    success: true,
    errors: [],
    parsed: input as Record<string, unknown>,
  };
}
