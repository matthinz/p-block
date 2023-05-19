import { FluentArrayParser } from "../array/types";
import { FluentBooleanParser } from "../boolean/types";
import { FluentDateParser } from "../date/types";
import { FluentNumberParser } from "../number/types";
import {
  FluentObjectParser,
  ParsedObjectType,
  PropertyParsers,
} from "../object/types";
import {
  FluentParserForType,
  Parser,
  UnionToIntersection,
} from "../shared/types";
import { FluentStringParser } from "../string/types";
import { FluentUnknownParser } from "../unknown/types";
import { FluentURLParser } from "../url/types";

export interface FluentParsingRoot {
  /**
   * Starts parsing a boolean value.
   */
  readonly boolean: FluentBooleanParser<boolean>;

  /**
   * Starts parsing a floating-point number.
   */
  readonly float: FluentNumberParser<number>;

  /**
   * Starts parsing a string value.
   */
  readonly string: FluentStringParser<string>;

  /**
   * Starts parsing a Date value.
   */
  readonly date: FluentDateParser<Date>;

  /**
   * Starts parsing an integer value.
   */
  readonly integer: FluentNumberParser<number>;

  /**
   * Starts parsing a nullish (null or undefined) value..
   */
  readonly nullish: FluentUnknownParser<null | undefined>;

  /**
   * Starts parsing a number value.
   */
  readonly number: FluentNumberParser<number>;

  /**
   * Starts parsing a WHATWG URL value.
   */
  readonly url: FluentURLParser<URL>;

  /**
   * @param parsers
   * @returns A fluent parser that requires input to pass _all_ input parsers.
   */
  allOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParserForType<UnionToIntersection<ReturnType<Parsers[number]>>>;

  /**
   * @param parsers
   * @returns A fluent parser that requires input to pass any of the given parsers.
   */
  anyOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParserForType<ReturnType<Parsers[number]>>;

  /**
   * Starts parsing input as an array where all items are parsed using the given parser.
   * @param itemParser Parser that each array item must pass.
   */
  array<T>(itemParser: Parser<T>): FluentArrayParser<T>;

  /**
   * Starts parsing input as an object.
   * @param properties
   */
  object<P extends PropertyParsers>(
    properties: P
  ): FluentObjectParser<ParsedObjectType<P>>;
}
