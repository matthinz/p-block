import { NormalizationFunction, Parser } from "../shared/types";

export interface FluentUnknownParser<T>
  extends Parser<T>,
    FluentUnknownParserMethods<T> {}

export interface FluentUnknownParserMethods<T> {
  /**
   * @param value
   * @returns A new FluentParser that will substitute `value` when the input is `null` or `undefined`.
   */
  defaultedTo<V extends T>(value: V): FluentUnknownParser<T | V>;

  /**
   * @param normalizer
   * @returns A new FluentParser that passes its input through the given normalization function during parsing.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentUnknownParser<V>;

  /**
   * @param parser
   * @returns A new FluentParser that passes its input to the given parser.
   */
  passes(parser: Parser<T>): FluentUnknownParser<T>;
}
