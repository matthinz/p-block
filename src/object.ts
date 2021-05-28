import { FluentParserImpl } from "./base";
import {
  ExtendObjectType,
  FluentObjectParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
  ParserMap,
  PropertyValidationFunction,
  ValidationErrorDetails,
} from "./types";
import { resolveErrorDetails } from "./utils";

const INVALID_TYPE_PARSE_RESULT: ParseResult<Record<string, unknown>> = {
  success: false,
  errors: [
    {
      code: "invalidType",
      message: "input must be an object",
      path: [],
    },
  ],
};

export const defaultObjectParser = {
  parse: (input: unknown): ParseResult<Record<string, unknown>> => {
    if (typeof input !== "object" || input == null || Array.isArray(input)) {
      return INVALID_TYPE_PARSE_RESULT;
    }

    return {
      success: true,
      errors: [],
      value: input as Record<string, unknown>,
    };
  },
};

export class FluentObjectParserImpl<Type extends Record<string, unknown>>
  extends FluentParserImpl<Type, FluentObjectParser<Type>>
  implements FluentObjectParser<Type> {
  constructor(root: FluentParsingRoot, parser: Parser<Type>) {
    super(root, parser, FluentObjectParserImpl);
  }

  defaultedTo(defaults: Partial<Type>): FluentObjectParser<Type> {
    const nextParser: Parser<Type> = {
      parse: (input: unknown) => {
        input = input == null ? defaults : input;

        const objectParseResult = defaultObjectParser.parse(input);
        if (!objectParseResult.success) {
          return objectParseResult;
        }

        return this.parse({
          ...defaults,
          ...objectParseResult.value,
        });
      },
    };
    return new FluentObjectParserImpl(this.root, nextParser);
  }

  propertiesMatch<
    PropertyName extends keyof Type,
    OtherPropertyName extends Exclude<keyof Type, PropertyName> &
      Type[PropertyName]
  >(
    propertyName: PropertyName,
    otherPropertyName: OtherPropertyName,

    errorCode?: string,
    errorMessage?: string
  ): FluentObjectParser<Type> {
    [errorCode, errorMessage] = resolveErrorDetails(
      "propertiesMatch",
      `input must include a value for property '${propertyName}' that matches the value for property '${otherPropertyName}'`,
      errorCode,
      errorMessage
    );

    return this.propertyPasses(
      propertyName,
      (value, obj) => {
        const otherValue = obj[otherPropertyName];
        return value === otherValue;
      },
      errorCode,
      errorMessage
    );
  }

  propertyPasses<PropertyName extends keyof Type>(
    propertyName: PropertyName,
    validators:
      | PropertyValidationFunction<Type[typeof propertyName], Type>
      | PropertyValidationFunction<Type[typeof propertyName], Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectParser<Type> {
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

  withProperties<Properties extends ParserMap>(
    properties: Properties
  ): FluentObjectParser<ExtendObjectType<Type, Properties>> {
    type NextType = ExtendObjectType<Type, Properties>;

    const nextParser: Parser<NextType> = {
      parse: (input: unknown): ParseResult<NextType> => {
        const prevParseResult = this.parse(input);
        if (!prevParseResult.success) {
          return prevParseResult;
        }

        const errors = Object.keys(properties).reduce(reducer, []);

        if (errors.length === 0) {
          return {
            success: true,
            errors: [],
            value: prevParseResult.value as NextType,
          };
        }

        return {
          success: false,
          errors,
        };

        function reducer(
          result: ValidationErrorDetails[],
          propertyName: string
        ): ValidationErrorDetails[] {
          if (!prevParseResult.success) {
            return result;
          }

          const propertyValue = prevParseResult.value[propertyName];
          const propertyValidator = properties[propertyName];
          const propertyResult = propertyValidator.parse(propertyValue);

          if (propertyResult.success) {
            return result;
          }

          if (propertyResult.errors.length === 0) {
            throw new Error("Failed parse() cannot return empty error array");
          }

          if (
            propertyValue === undefined &&
            propertyResult.errors.length === 1 &&
            propertyResult.errors[0].code === "invalidType"
          ) {
            result.push({
              code: "required",
              message: `input must include property '${propertyName}'`,
              path: [...propertyResult.errors[0].path, propertyName],
            });
          } else {
            result.push(
              ...propertyResult.errors.map((e) => ({
                ...e,
                path: [propertyName, ...e.path],
              }))
            );
          }

          return result;
        }
      },
    };

    return new FluentObjectParserImpl(this.root, nextParser);
  }
}
