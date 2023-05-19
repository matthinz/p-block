import { FluentParser } from "../shared/types";

export interface FluentComparableParser<
  T extends Date | number,
  ParserType extends FluentParser<T>
> extends FluentParser<T> {
  /**
   * @param inclusiveMinimum
   * @param inclusiveMaximum
   * @returns A new parser that checks that its input is between the given (inclusive) values.
   */
  between(inclusiveMinimum: T, inclusiveMaximum: T): ParserType;

  /**
   * @param inclusiveMinimum
   * @param inclusiveMaximum
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is between the given (inclusive) values.
   */
  between(
    inclusiveMinimum: T,
    inclusiveMaximum: T,
    errorCode: string,
    errorMessage?: string
  ): ParserType;

  /**
   * @param value
   * @returns A new parser that checks that its input is equal to the given value.
   */
  equalTo(value: T): ParserType;

  /**
   * @param value
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is equal to the given value.
   */
  equalTo(value: T, errorCode: string, errorMessage?: string): ParserType;

  /**
   * @param value
   * @returns A new parser that checks that its input is greater than the given value.
   */
  greaterThan(value: T): ParserType;

  /**
   * @param value
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is greater than the given value.
   */
  greaterThan(value: T, errorCode: string, errorMessage?: string): ParserType;

  /**
   * @param value
   * @returns A new parser that checks that its input is greater than or equal to the given value.
   */
  greaterThanOrEqualTo(value: T): ParserType;

  /**
   * @param value
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is greater than or equal to the given value.
   */
  greaterThanOrEqualTo(
    value: T,
    errorCode: string,
    errorMessage?: string
  ): ParserType;

  /**
   * @param value
   * @returns A new parser that checks that its input is less than the given value.
   */
  lessThan(value: T): ParserType;

  /**
   * @param value
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is less than the given value.
   */
  lessThan(value: T, errorCode: string, errorMessage?: string): ParserType;

  /**
   * @param value
   * @returns A new parser that checks that its input is less than or equal to the given value.
   */
  lessThanOrEqualTo(value: T): ParserType;

  /**
   * @param value
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A new parser that checks that its input is less than or equal to the given value.
   */
  lessThanOrEqualTo(
    value: T,
    errorCode: string,
    errorMessage?: string
  ): ParserType;
}
