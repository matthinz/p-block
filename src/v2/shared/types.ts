import { FluentArrayParser } from "../array/types";
import { FluentBooleanParser } from "../boolean/types";
import { FluentDateParser } from "../date/types";
import { FluentNumberParser } from "../number/types";
import { FluentObjectParser } from "../object/types";
import { FluentStringParser } from "../string/types";
import { FluentUnknownParser } from "../unknown/types";
import { FluentURLParser } from "../url/types";

/**
 * Error interface used to group multiple parsing errors for the purpose of
 * throwing them.
 */
export interface CompoundParseError {
  readonly code: "mutlipleErrors";
  readonly message: string;
  readonly errors: ReadonlyArray<ParseError>;
}

export type NormalizationFunction<T, V extends T> = (input: T) => V;

/**
 * Interface encapsulating a single error encountered during parsing.
 */
export interface ParseError {
  readonly code: string;
  readonly message: string;
  readonly path: ReadonlyArray<string | number>;
}

/**
 * The result of a parse operation.
 */
export type ParseResult<T> =
  | {
      readonly success: true;
      readonly errors: [];
      readonly value: T;
    }
  | {
      readonly success: false;
      readonly errors: ReadonlyArray<ParseError>;
    };

export interface Parser<T> {
  /**
   * Attempts to parse the given input.
   * @returns The parsed value, if successful.
   * @throws {CompoundParseError|ParseError} If multiple errors are encountered during parsing, they will be wrapped in a `CompoundParseError`.
   */
  (input: unknown): T;

  /**
   * Attempts to parse the given input.
   * @returns A ParseResult<T> describing the result of the parse operation, including any errors encountered.
   */
  parse(input: unknown): ParseResult<T>;
}

export interface FluentParser<T> extends Parser<T> {
  /**
   * @returns A version of this parser that will also accept null or undefined values.
   */
  readonly optional: FluentParser<T | void>;
}

export type UnionToIntersection<Type> = (
  Type extends any ? (x: Type) => any : never
) extends (x: infer Result) => any
  ? Result
  : never;

export type FluentParserForType<T> = T extends boolean
  ? FluentBooleanParser<T>
  : T extends string
  ? FluentStringParser<T>
  : T extends Date
  ? FluentDateParser<T>
  : T extends number
  ? FluentNumberParser<T>
  : T extends URL
  ? FluentURLParser<T>
  : T extends Array<infer I>
  ? FluentArrayParser<I>
  : T extends Record<string, unknown>
  ? FluentObjectParser<T>
  : FluentUnknownParser<T>;
