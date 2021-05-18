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
            parsed: value,
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
          parsed: normalizer(parsed.parsed),
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

  parse(input: unknown): ParseResult<Type> {
    return this.parser.parse(input);
  }

  passes(
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    const validator = applyErrorDetails(
      composeValidators(validators),
      "invalid",
      "input was invalid",
      errorCode,
      errorMessage
    );

    const nextParser = {
      ...this.parser,
      parse: (input: unknown): ParseResult<Type> => {
        const parsed = this.parse(input);
        if (!parsed.success) {
          return parsed;
        }

        const validationResult = validator(parsed.parsed);
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
      },
    };

    return new this.ctor(this.root, nextParser);
  }
}
