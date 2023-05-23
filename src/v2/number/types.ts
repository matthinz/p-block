import { FluentComparableParserMethods } from "../comparable/types";
import { NormalizationFunction, Parser } from "../shared/types";

export interface FluentNumberParser<T extends number>
  extends Parser<T>,
    FluentNumberParserMethods<T> {}

export interface FluentNumberParserMethods<T extends number>
  extends FluentComparableParserMethods<T, FluentNumberParser<T>> {
  /**
   * @returns A new FluentNumberParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: V): FluentNumberParser<T | V>;

  /**
   * @returns A new FluentNumberParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentNumberParser<V>;

  /**
   * @returns A new FluentNumberParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentNumberParser<T>;
}
