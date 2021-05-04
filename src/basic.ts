import {
  NormalizationFunction,
  Parser,
  ParseResult,
  ParsingFunction,
  ValidationFunction,
} from "./types";
import {
  applyErrorDetails,
  composeNormalizers,
  composeValidators,
} from "./utils";

export abstract class BasicValidator<Type, ValidatorType extends Parser<Type>> {
  protected readonly parser: ParsingFunction<Type>;
  protected readonly normalizer?: NormalizationFunction<Type>;
  protected readonly validator?: ValidationFunction<Type>;
  private readonly ctor: new (
    parser: ParsingFunction<Type>,
    normalizer?: NormalizationFunction<Type>,
    validator?: ValidationFunction<Type>
  ) => ValidatorType;

  constructor(
    ctor: new (
      parser: ParsingFunction<Type>,
      normalizer?: NormalizationFunction<Type>,
      validator?: ValidationFunction<Type>
    ) => ValidatorType,
    parser: ParsingFunction<Type>,
    normalizer?: NormalizationFunction<Type>,
    validator?: ValidationFunction<Type>
  ) {
    this.ctor = ctor;
    this.parser = parser;
    this.normalizer = normalizer;
    this.validator = validator;
  }

  defaultedTo(value: Type): ValidatorType {
    const nextParser = (input: unknown): ParseResult<Type> => {
      if (input == null) {
        return {
          success: true,
          errors: [],
          parsed: value,
        };
      }

      return this.parser(input);
    };

    return this.derive(nextParser, this.normalizer, this.validator);
  }

  normalize(input: Type): Type {
    return this.normalizer ? this.normalizer(input) : input;
  }

  normalizedWith(
    ...normalizers: (
      | NormalizationFunction<Type>
      | NormalizationFunction<Type>[]
    )[]
  ): ValidatorType {
    return this.derive(
      this.parser,
      composeNormalizers(this.normalizer, ...normalizers),
      this.validator
    );
  }

  parse(input: unknown): ParseResult<Type> {
    const parsed = this.parser(input);

    if (!parsed.success) {
      return parsed;
    }

    const normalizedInput = this.normalize(parsed.parsed);

    if (this.validator) {
      const validationResult = this.validator(normalizedInput);
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
    }

    return {
      success: true,
      errors: [],
      parsed: normalizedInput,
    };
  }
  passes(
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    errorCode?: string,
    errorMessage?: string
  ): ValidatorType {
    const validator = applyErrorDetails(
      composeValidators(this.validator, validators),
      "invalid",
      "input was invalid",
      errorCode,
      errorMessage
    );

    return this.derive(this.parser, this.normalizer, validator);
  }

  validate(input: unknown): input is Type {
    const { success } = this.parse(input);
    return success;
  }

  protected derive(
    parser?: ParsingFunction<Type>,
    normalizer?: NormalizationFunction<Type>,
    validator?: ValidationFunction<Type>
  ): ValidatorType {
    return new this.ctor(
      parser ?? this.parser,
      composeNormalizers(this.normalizer, normalizer),
      composeValidators(this.validator, validator)
    );
  }
}
