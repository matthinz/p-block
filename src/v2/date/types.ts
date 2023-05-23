import { FluentComparableParserMethods } from "../comparable/types";
import { NormalizationFunction, Parser } from "../shared/types";

export interface FluentDateParser<T extends Date>
  extends FluentDateParserMethods<T>,
    Parser<T> {}

export interface FluentDateParserMethods<T extends Date>
  extends FluentComparableParserMethods<T, FluentDateParser<T>> {
  /**
   * @returns A new FluentDateParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: V): FluentDateParser<T | V>;

  /**
   * @returns A new FluentDateParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentDateParser<V>;

  /**
   * @returns A new FluentDateParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentDateParser<T>;
}
