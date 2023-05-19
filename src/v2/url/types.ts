import { FluentStringParser } from "../../types";
import { NormalizationFunction, Parser } from "../shared/types";

export type KnownProtocol = "http:" | "https:" | "ftp:" | "mailto:";

export interface FluentURLParser<T extends URL> extends Parser<T> {
  /**
   * @returns A new FluentURLParser that will substitute the given value when parsing `null` or `undefined` values.
   */
  defaultedTo<V extends T>(value: V): FluentURLParser<T | V>;

  /**
   * Validates that the incoming URL is using the HTTP or HTTPS protocol.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  httpOrHttpsOnly(): FluentURLParser<T>;

  /**
   * Validates that the incoming URL is using the HTTP or HTTPS protocol.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  httpOrHttpsOnly(errorCode: string, errorMessage?: string): FluentURLParser<T>;

  /**
   * Validates that the incoming URL is using the HTTPS protocol.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  httpsOnly(): FluentURLParser<T>;

  /**
   * Validates that the incoming URL is using the HTTPS protocol.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  httpsOnly(errorCode: string, errorMessage?: string): FluentURLParser<T>;

  /**
   * @returns A new FluentURLParser that will pass input through the given normalization function.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentURLParser<V>;

  /**
   * @returns A new FluentURLParser that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentURLParser<T>;

  /**
   * Validates that the incoming URL uses the given protocol. If more than
   * one is specified, validation will pass if the URL uses any of them.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  protocol(protocol: KnownProtocol): FluentURLParser<T>;

  /**
   * Validates that the incoming URL uses the given protocol. If more than
   * one is specified, validation will pass if the URL uses any of them.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  protocol(protocol: (KnownProtocol | string)[]): FluentURLParser<T>;

  /**
   * Validates that the incoming URL uses the given protocol. If more than
   * one is specified, validation will pass if the URL uses any of them.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentURLParser<T> to further manipulate the value.
   */
  protocol(
    protocol: (KnownProtocol | string)[],
    errorCode: string,
    errorMessage?: string
  ): FluentURLParser<T>;

  /**
   * Converts the URL back to its string representation.
   * @returns A FluentStringParser for further manipulating the value.
   */
  stringified(): FluentStringParser<string>;
}
