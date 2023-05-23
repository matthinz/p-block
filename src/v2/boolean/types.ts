import { NormalizationFunction, Parser, ParserMethods } from "../shared/types";

export interface FluentBooleanParserMethods<T extends boolean>
  extends ParserMethods<T> {
  /**
   * @returns A new FluentBooleanParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: V): FluentBooleanParser<T | V>;

  /**
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentBooleanParser that will only allow `false` values.
   */
  isFalse(
    errorCode?: string,
    errorMessage?: string
  ): Omit<FluentBooleanParser<false>, "isTrue" | "isFalse">;

  /**
   * @param errorCode
   * @param errorMessage
   * @returns A new FluentBooleanParser that will only allow `true` values.
   */
  isTrue(
    errorCode?: string,
    errorMessage?: string
  ): Omit<FluentBooleanParser<false>, "isTrue" | "isFalse">;

  /**
   * @returns A new FluentBooleanParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentBooleanParser<V>;

  /**
   * @returns A new FluentBooleanParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentBooleanParser<T>;
}

export interface FluentBooleanParser<T extends boolean>
  extends Parser<T>,
    FluentBooleanParserMethods<T> {}
