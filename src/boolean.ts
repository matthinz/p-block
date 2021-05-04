import { BasicValidator } from "./basic";
import {
  FluentParser,
  NormalizationFunction,
  ParseResult,
  ParsingFunction,
  ValidationFunction,
} from "./types";

export interface FluentBooleanValidator
  extends FluentParser<boolean, FluentBooleanValidator> {
  defaultedTo(value: boolean): FluentBooleanValidator;
  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanValidator;
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
