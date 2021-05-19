import { FluentParserImpl } from "./base";
import { FluentParser, FluentParsingRoot, Parser } from "./types";
import { resolveErrorDetails } from "./utils";

type FluentParserConstructor<
  Type,
  FluentParserType extends FluentParser<Type>
> = new (root: FluentParsingRoot, parser: Parser<Type>) => FluentParserType;

export abstract class FluentComparableParserImpl<
  Type extends Date | number,
  FluentParserType extends FluentParser<Type>
> extends FluentParserImpl<Type, FluentParserType> {
  constructor(
    root: FluentParsingRoot,
    parser: Parser<Type>,
    ctor: FluentParserConstructor<Type, FluentParserType>
  ) {
    super(root, parser, ctor);
  }

  between(
    inclusiveMinimum: Type | (() => Type),
    inclusiveMaximum: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passes((value) => {
      const min =
        typeof inclusiveMinimum === "function"
          ? inclusiveMinimum()
          : inclusiveMinimum;
      const max =
        typeof inclusiveMaximum === "function"
          ? inclusiveMaximum()
          : inclusiveMaximum;
      if (value < min || value > max) {
        const [code, message] = resolveErrorDetails(
          "between",
          `input must be between ${toString(min)} and ${toString(
            max
          )} (inclusive)`,
          errorCode,
          errorMessage
        );
        return {
          code,
          message,
          path: [],
        };
      }
      return true;
    });
  }

  equalTo(
    value: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs.valueOf() === rhs.valueOf(),
      "equalTo",
      (lhs, rhs) => `input must be equal to ${toString(rhs)}`,
      errorCode,
      errorMessage
    );
  }

  greaterThan(
    value: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs > rhs,
      "greaterThan",
      (lhs, rhs) => `input must be greater than ${toString(rhs)}`,
      errorCode,
      errorMessage
    );
  }

  greaterThanOrEqualTo(
    value: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs >= rhs,
      "greaterThanOrEqualTo",
      (lhs, rhs) => `input must be greater than or equal to ${toString(rhs)}`,
      errorCode,
      errorMessage
    );
  }

  lessThan(
    value: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs < rhs,
      "lessThan",
      (lhs, rhs) => `input must be less than ${toString(rhs)}`,
      errorCode,
      errorMessage
    );
  }

  lessThanOrEqualTo(
    value: Type | (() => Type),
    errorCode?: string,
    errorMessage?: string
  ): FluentParserType {
    return this.passesComparison(
      value,
      (lhs, rhs) => lhs <= rhs,
      "lessThanOrEqualTo",
      (lhs, rhs) => `input must be less than or equal to ${toString(rhs)}`,
      errorCode,
      errorMessage
    );
  }

  protected passesComparison(
    value: Type | (() => Type),
    compare: (lhs: Type, rhs: Type) => boolean,
    defaultErrorCode: string,
    defaultErrorMessage: (lhs: Type, rhs: Type) => string,
    providedErrorCode?: string,
    providedErrorMessage?: string
  ): FluentParserType {
    return this.passes((input) => {
      const actualValue = typeof value === "function" ? value() : value;
      if (compare(input, actualValue)) {
        return true;
      }

      const [code, message] = resolveErrorDetails(
        defaultErrorCode,
        defaultErrorMessage(input, actualValue),
        providedErrorCode,
        providedErrorMessage
      );

      return {
        code,
        message,
        path: [],
      };
    });
  }
}

function toString(value: number | Date): string {
  return value instanceof Date ? value.toISOString() : value.toString();
}
