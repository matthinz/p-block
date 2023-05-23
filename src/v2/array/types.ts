import { FluentMeasurableParserMethods } from "../measurable/types";
import { NormalizationFunction, Parser } from "../shared/types";

export interface FluentArrayParser<T>
  extends Parser<T[]>,
    FluentArrayParserMethods<T> {}

export interface FluentArrayParserMethods<T>
  extends FluentMeasurableParserMethods<T[], FluentArrayParser<T>> {
  /**
   * @returns A new FluentArrayParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: T[]): FluentArrayParser<T[] | V[]>;

  /**
   * @param predicate Function used in filtering.
   * @returns a new FluentArrayParser that will transform its input into a new array by calling .filter with the given predicate.
   */
  filtered(predicate: (item: T) => boolean): FluentArrayParser<T>;

  /**
   * @param mapper Function used in mapping.
   * @returns a new FluentArrayParser that will transform its input into a new array by calling .map with the given function.
   */
  mapped<V>(mapper: (item: T) => V): FluentArrayParser<V>;

  /**
   * @returns A new FluentArrayParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentArrayParser<V>;

  /**
   * @param itemParser Parser applied to each item in the array.
   * @returns a FluentArrayParser where each item has been parsed using `itemParser`.
   */
  of<V extends T>(itemParser: Parser<V>): FluentArrayParser<V>;

  /**
   * @returns A new FluentArrayParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentArrayParser<T>;
}
