import { BasicValidator } from "./basic";
import {
  FluentValidator,
  NormalizationFunction,
  Normalizer,
  NormalizerArgs,
  ParseResult,
  ParsingFunction,
  ValidationFunction,
  ValidatorArgs,
} from "./types";
import {
  applyErrorDetails,
  composeNormalizers,
  composeValidators,
} from "./utils";

export interface FluentBooleanValidator extends FluentValidator<boolean> {
  defaultedTo(value: boolean): FluentBooleanValidator;
  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  normalizedWith(
    normalizers:
      | NormalizationFunction<boolean>
      | Normalizer<boolean>
      | (NormalizationFunction<boolean> | Normalizer<boolean>)[]
  ): FluentBooleanValidator;
}

export class BooleanValidator
  extends BasicValidator<boolean, FluentBooleanValidator>
  implements FluentBooleanValidator {
  constructor(
    parser?: ParsingFunction<boolean>,
    normalizer?: NormalizationFunction<boolean>,
    validator?: ValidationFunction<boolean>
  ) {
    super(
      BooleanValidator,
      parser ?? defaultBooleanParser,
      normalizer,
      validator
    );
  }

  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator {
    return this.passes(
      (value) => !value,
      errorCode ?? "isFalse",
      errorMessage ?? "input must be false"
    );
  }

  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator {
    return this.passes(
      (value) => value,
      errorCode ?? "isTrue",
      errorMessage ?? "input must be true"
    );
  }

  normalizedWith(normalizers: NormalizerArgs<boolean>): FluentBooleanValidator {
    return new BooleanValidator(
      this.parser,
      composeNormalizers(this.normalizer, normalizers),
      this.validator
    );
  }

  passes(
    validators: ValidatorArgs<boolean>,
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanValidator {
    return new BooleanValidator(
      this.parser,
      this.normalizer,
      applyErrorDetails(
        composeValidators(this.validator, validators),
        "invalid",
        "input was invalid",
        errorCode,
        errorMessage
      )
    );
  }
}

function defaultBooleanParser(input: unknown): ParseResult<boolean> {
  if (typeof input === "boolean") {
    return {
      success: true,
      errors: [],
      parsed: input,
    };
  }

  return {
    success: false,
    errors: [
      {
        code: "invalidType",
        message: "input must be of type 'boolean'",
        path: [],
      },
    ],
  };
}
