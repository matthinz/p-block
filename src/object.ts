import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentParser,
  NormalizationFunction,
  ParsedType,
  Parser,
  ParseResult,
  ParsingFunction,
  PropertyValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
} from "./types";
import { composeValidators } from "./utils";

type ParserDictionary = {
  [property: string]: Parser<unknown>;
};

export interface FluentObjectValidator<Type extends Record<string, unknown>>
  extends FluentParser<Type, FluentObjectValidator<Type>> {
  defaultedTo<Defaults extends { [property in keyof Type]?: Type[property] }>(
    values: Defaults
  ): FluentObjectValidator<Type>;

  propertyPasses<PropertyName extends keyof Type>(
    propertyName: PropertyName,
    validators:
      | PropertyValidationFunction<Type[typeof propertyName], Type>
      | PropertyValidationFunction<Type[typeof propertyName], Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectValidator<Type>;

  /**
   * @param properties
   * @returns A new validator, derived from this one, that verifies that all properties
   *          listed in `properties` are present and pass validation rules supplied.
   */
  withProperties<
    PropertyParsers extends {
      [property: string]: Parser<any>;
    }
  >(
    properties: PropertyParsers
  ): FluentObjectValidator<
    Type &
      {
        [property in keyof PropertyParsers]: ParsedType<
          typeof properties[property]
        >;
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

  propertyPasses<PropertyName extends keyof Type>(
    propertyName: PropertyName,
    validators:
      | PropertyValidationFunction<Type[typeof propertyName], Type>
      | PropertyValidationFunction<Type[typeof propertyName], Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectValidator<Type> {
    return this.passes(
      (obj): true | ValidationErrorDetails[] => {
        validators = Array.isArray(validators) ? validators : [validators];
        const value = obj[propertyName];

        const errors = validators.reduce<ValidationErrorDetails[]>(
          (result, validator) => {
            const validationResult = validator(value, obj);
            if (validationResult === false) {
              [errorCode, errorMessage] = resolveErrorDetails(
                "propertyPasses",
                `input must include a valid value for the property '${propertyName}'`,
                errorCode,
                errorMessage
              );

              result.push({
                code: errorCode,
                message: errorMessage,
                path: [propertyName],
              });
            } else if (Array.isArray(validationResult)) {
              result.push(
                ...validationResult.map((e) => ({
                  ...e,
                  path: [...e.path, propertyName],
                }))
              );
            } else if (validationResult !== true) {
              result.push({
                ...validationResult,
                path: [...validationResult.path, propertyName],
              });
            }

            return result;
          },
          []
        );

        if (errors.length === 0) {
          return true;
        }

        return errors;
      },
      errorCode,
      errorMessage
    );
  }

  withProperties<Properties extends ParserDictionary>(
    properties: Properties
  ): FluentObjectValidator<
    Type &
      {
        [property in keyof Properties]: ParsedType<typeof properties[property]>;
      }
  > {
    type NextType = Type &
      {
        [property in keyof Properties]: ParsedType<typeof properties[property]>;
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
