import {
  FluentParser,
  FluentParsingRoot,
  NormalizationFunction,
  Parser,
  ParseResult,
  ValidationFunction,
} from "./types";
import {
  applyErrorDetails,
  composeNormalizers,
  composeValidators,
} from "./utils";

type FluentParserConstructor<
  Type,
  FluentParserType extends FluentParser<Type>
> = new (root: FluentParsingRoot, parser: Parser<Type>) => FluentParserType;

export class FluentParserImpl<Type, FluentParserType extends FluentParser<Type>>
  implements FluentParser<Type> {
  private readonly ctor: FluentParserConstructor<Type, FluentParserType>;

  constructor(
    protected readonly root: FluentParsingRoot,
    protected readonly parser: Parser<Type>,
    ctor?: FluentParserConstructor<Type, FluentParserType>
  ) {
    // NOTE: Assuming here that if ctor is not provided, we are attempting
    //       to instantiate
    if (!ctor && this.constructor !== FluentParserImpl) {
      throw new Error(
        "Subclasses _must_ provide the `ctor` argument to the FluentParserImpl constructor"
      );
    }

    this.ctor =
      ctor ??
      ((FluentParserImpl as unknown) as FluentParserConstructor<
        Type,
        FluentParserType
      >);
  }

  defaultedTo(value: Type): FluentParserType {
    const nextParser: Parser<Type> = {
      ...this.parser,
      parse: (input: unknown): ParseResult<Type> => {
        if (input == null) {
          return {
            success: true,
            errors: [],
            value,
          };
        }

        return this.parser.parse(input);
      },
    };

    return new this.ctor(this.root, nextParser);
  }

  normalizedWith(
    ...normalizers: (
      | NormalizationFunction<Type>
      | NormalizationFunction<Type>[]
    )[]
  ): FluentParserType {
    const nextParser = {
      ...this.parser,
      parse: (input: unknown): ParseResult<Type> => {
        const parsed = this.parse(input);
        if (!parsed.success) {
          return parsed;
        }

        const normalizer = composeNormalizers(...normalizers);
        return {
          ...parsed,
          value: normalizer(parsed.value),
        };
      },
    };
    return new this.ctor(this.root, nextParser);
  }

  optional(): FluentParser<Type | undefined> {
    return this.or(this.root.nullish());
  }

  or<OtherType>(parser: Parser<OtherType>): FluentParser<Type | OtherType> {
    return this.root.anyOf(this.parser, parser);
  }

  parse = (input: unknown): ParseResult<Type> => {
    return this.parser.parse(input);
  };

  passes(
    validatorOrValidatorArrayOrParser:
      | ValidationFunction<Type>
      | ValidationFunction<Type>[]
      | Parser<Type>,
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    const nextParser = {
      ...this.parser,
      parse: (input: unknown): ParseResult<Type> => {
        const parsed = this.parse(input);
        if (!parsed.success) {
          return parsed;
        }

        if (
          typeof validatorOrValidatorArrayOrParser === "function" ||
          Array.isArray(validatorOrValidatorArrayOrParser)
        ) {
          const validator = applyErrorDetails(
            composeValidators(validatorOrValidatorArrayOrParser),
            "invalid",
            "input was invalid",
            errorCode,
            errorMessage
          );

          const validationResult = validator(parsed.value);
          if (validationResult === false) {
            throw new Error(
              "No error code could be determined to report validation failure"
            );
          } else if (validationResult !== true) {
            const errors = Array.isArray(validationResult)
              ? validationResult
              : [validationResult];
            return {
              success: false,
              errors,
            };
          }
          return parsed;
        }

        const parser: Parser<Type> = validatorOrValidatorArrayOrParser;
        return parser.parse(parsed.value);
      },
    };

    return new this.ctor(this.root, nextParser);
  }

  protected internalParsedAs<
    NextType,
    FluentParserType extends FluentParser<NextType>
  >(
    ctor: {
      new (root: FluentParsingRoot, parser: Parser<NextType>): FluentParserType;
    },
    defaultParser: (input: Type) => NextType | undefined,
    defaultErrorCode: string,
    defaultErrorMessage: string,
    parserOrErrorCode?: ((input: Type) => NextType | undefined) | string,
    errorCodeOrErrorMessage?: string,
    errorMessage?: string
  ): FluentParserType {
    const nextParser: Parser<NextType> = {
      parse: (input: unknown): ParseResult<NextType> => {
        const parseResult = this.parse(input);
        if (!parseResult.success) {
          return parseResult;
        }

        const parser =
          typeof parserOrErrorCode === "function"
            ? parserOrErrorCode
            : defaultParser;

        const value = parser(parseResult.value);

        if (value !== undefined) {
          return {
            success: true,
            errors: [],
            value,
          };
        }

        let code =
          typeof parserOrErrorCode === "function"
            ? errorCodeOrErrorMessage
            : parserOrErrorCode;

        let message =
          typeof parserOrErrorCode === "function"
            ? errorMessage
            : errorCodeOrErrorMessage;

        if (code == null) {
          code = defaultErrorCode;
          message = defaultErrorMessage;
        } else {
          message = message ?? code;
        }

        return {
          success: false,
          errors: [
            {
              code,
              message,
              path: [],
            },
          ],
        };
      },
    };

    return new ctor(this.root, nextParser);
  }
}
