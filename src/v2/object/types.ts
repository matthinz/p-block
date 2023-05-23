import { NormalizationFunction, Parser } from "../shared/types";

export type PropertyParsers = { [property: string]: Parser<unknown> };

export type ParsedObjectType<P extends PropertyParsers> = {
  [property in keyof P]: ReturnType<P[property]>;
};

export interface FluentObjectParser<T extends Record<string, unknown>>
  extends Parser<T>,
    FluentObjectParserMethods<T> {}

export interface FluentObjectParserMethods<T extends Record<string, unknown>> {
  /**
   * @returns A FluentObjectParser that _also_ allows any other properties not already defined.
   */
  readonly allowOtherProperties: FluentObjectParser<
    T & Record<string, unknown>
  >;

  /**
   * @returns A new FluentObjectParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: V): FluentObjectParser<T | V>;

  /**
   * @returns A new FluentObjectParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentObjectParser<V>;

  /**
   * @returns A new FluentObjectParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentObjectParser<T>;

  /**
   * @returns A new FluentObjectParser, extended to include the given properties.
   */
  withProperties<Properties extends PropertyParsers>(
    properties: Properties
  ): FluentObjectParser<T & ParsedObjectType<Properties>>;

  /**
   * @param regex
   * @returns A new FluentObjectParser that allows properties with names passing the given regular expression.
   */
  withPropertiesMatching<V>(
    regex: RegExp,
    parser: Parser<V>
  ): FluentObjectParser<T & { [property: string]: V }>;
}
