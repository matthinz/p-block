import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentParser,
  NormalizationFunction,
  ParseResult,
  ParsingFunction,
  ValidationErrorDetails,
  ValidationFunction,
} from "./types";
import {
  composeNormalizers,
  composeValidators,
  createDefaultParser,
} from "./utils";

export interface FluentNumberValidator
  extends FluentParser<number, FluentNumberValidator> {
  defaultedTo(value: number): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is equal to a given value.
   */
  equalTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is greater than a given value.
   */
  greaterThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is greater than or equal to a given value.
   */
  greaterThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is less than a given value.
   */
  lessThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentNumberValidator, derived from this one, that validates input is less than or equal to a given value.
   */
  lessThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator;

  /**
   * @param decimalPlaces
   * @returns A new FluentNumberValidator, derived from this one, that rounds its input to the given number of decimal places before validating.
   */
  roundedTo(decimalPlaces: number): FluentNumberValidator;

  /**
   * @returns A new FluentNumberValidator, derived from this one, that truncates the decimal portion of its input before validation.
   */
  truncated(): FluentNumberValidator;
}

export class NumberValidator
  extends BasicValidator<number, FluentNumberValidator>
  implements FluentNumberValidator {
  constructor(
    parser?: ParsingFunction<number>,
    normalizer?: NormalizationFunction<number>,
    validator?: ValidationFunction<number>
  ) {
    super(NumberValidator, parser ?? finiteNumberParser, normalizer, validator);
  }

  equalTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs === rhs,
      "equalTo",
      (lhs, rhs) => `input must be equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  greaterThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs > rhs,
      "greaterThan",
      (lhs, rhs) => `input must be greater than ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  greaterThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs >= rhs,
      "greaterThanOrEqualTo",
      (lhs, rhs) => `input must be greater than or equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  lessThan(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs < rhs,
      "lessThan",
      (lhs, rhs) => `input must be less than ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  lessThanOrEqualTo(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberValidator {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs <= rhs,
      "lessThanOrEqualTo",
      (lhs, rhs) => `input must be less than or equal to ${rhs}`,
      errorCode,
      errorMessage
    );
  }

  roundedTo(decimalPlaces = 0): FluentNumberValidator {
    const nextNormalizer = (input: number) => {
      const exp = Math.pow(10, decimalPlaces);
      return Math.round(input * exp) / exp;
    };

    return new NumberValidator(
      this.parser,
      composeNormalizers(this.normalizer, nextNormalizer),
      this.validator
    );
  }

  truncated(): FluentNumberValidator {
    const nextNormalizer = (input: number) => Math.floor(input);
    return new NumberValidator(
      this.parser,
      composeNormalizers(this.normalizer, nextNormalizer),
      this.validator
    );
  }

  private passesComparison(
    value: number | (() => number),
    comparison: (lhs: number, rhs: number) => boolean,
    defaultErrorCode: string,
    defaultErrorMessage: (lhs: number, rhs: number) => string,
    providedErrorCode?: string,
    providedErrorMessage?: string
  ): FluentNumberValidator {
    function comparisonValidator(input: number): true | ValidationErrorDetails {
      const valueToCompareAgainst =
        typeof value === "function" ? value() : value;
      if (comparison(input, valueToCompareAgainst)) {
        return true;
      }

      const [errorCode, errorMessage] = resolveErrorDetails(
        defaultErrorCode,
        defaultErrorMessage(input, valueToCompareAgainst),
        providedErrorCode,
        providedErrorMessage
      );

      return {
        code: errorCode,
        message: errorMessage,
        path: [],
      };
    }
    return new NumberValidator(
      this.parser,
      this.normalizer,
      composeValidators(this.validator, comparisonValidator)
    );
  }
}

const defaultNumberParser = createDefaultParser<number>("number");

function finiteNumberParser(input: unknown): ParseResult<number> {
  const result = defaultNumberParser(input);
  if (!result.success) {
    return result;
  }

  if (!isFinite(result.parsed)) {
    return {
      success: false,
      errors: [
        {
          code: "invalidNumber",
          message: "input must be a finite number",
          path: [],
        },
      ],
    };
  }

  return result;
}
