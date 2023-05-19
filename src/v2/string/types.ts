import { FluentNumberParser } from "../number/types";
import { FluentBooleanParser } from "../boolean/types";
import { FluentDateParser } from "../date/types";
import { NormalizationFunction, Parser } from "../shared/types";
import { FluentURLParser } from "../url/types";
import { FluentMeasurableParser } from "../measurable/types";

export interface FluentStringParser<T extends string>
  extends FluentMeasurableParser<T, FluentStringParser<T>> {
  /**
   * @param value Default value used when parsing `null` or `undefined`.
   */
  defaultedTo<V extends T>(value: V): FluentStringParser<T | V>;

  /**
   * @returns A FluentStringValidator<T>, derived from this one, that validates its input looks like an email address according to the WHATWG HTML Living Standard (see https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address)
   */
  email(): FluentStringParser<T>;

  /**
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentStringValidator<T>, derived from this one, that validates its input looks like an email address according to the WHATWG HTML Living Standard (see https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address)
   */
  email(errorCode: string, errorMessage?: string): FluentStringParser<T>;

  /**
   * @returns A FluentStringParser that converts input to lower case during parsing.
   */
  lowerCased(): FluentStringParser<Lowercase<T>>;

  /**
   * @param regex Pattern to test.
   * @returns A FluentStringParser that validates its input matches the given regular expression.
   */
  matches(regex: RegExp): FluentStringParser<T>;

  /**
   * @param regex Pattern to test.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentStringParser that validates its input matches the given regular expression.
   */
  matches(
    regex: RegExp,
    errorCode: string,
    errorMessage?: string
  ): FluentStringParser<T>;

  /**
   * @param normalizer
   * @returns A FluentStringParser<T> that passes its input through the given normalizer during parsing.
   */
  normalizedWith<V extends T>(
    normalizer: NormalizationFunction<T, V>
  ): FluentStringParser<V>;

  /**
   * @param values The set of valid values.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentStringParser that validates its input is included in `values`.
   */
  oneOf<V extends T>(values: V[]): FluentStringParser<V>;

  /**
   * @param values The set of valid values.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentStringParser that validates its input is included in `values`.
   */
  oneOf<V extends T>(
    values: V[],
    errorCode: string,
    errorMessage?: string
  ): FluentStringParser<V>;

  /**
   * @returns A new FluentStringParser<T> that will pass its input through the given parser.
   */
  passes(parser: Parser<T>): FluentStringParser<T>;

  /**
   * Attempts to parse a string into a boolean value.
   * @returns A FluentBooleanParser<boolean> to further manipulate the value.
   */
  parsedAsBoolean(): FluentBooleanParser<boolean>;

  /**
   * Attempts to parse a string into a boolean value.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentBooleanParser<boolean> to further manipulate the value.
   */
  parsedAsBoolean(
    errorCode: string,
    errorMessage?: string
  ): FluentBooleanParser<boolean>;

  /**
   * Attempts to parse a string into a boolean value.
   * @returns A FluentBooleanParser<boolean> to further manipulate the value.
   */
  parsedAsBoolean(
    parser: (input: T) => boolean | undefined
  ): FluentBooleanParser<boolean>;

  /**
   * Attempts to parse a string into a boolean value.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentBooleanParser<boolean> to further manipulate the value.
   */
  parsedAsBoolean(
    parser: (input: T) => boolean | undefined,
    errorCode: string,
    errorMessage?: string
  ): FluentBooleanParser<boolean>;

  /**
   * Attempts to parse the input into a Date value.
   * @returns A FluentDateParser<Date> instance to further manipulate the value.
   */
  parsedAsDate(): FluentDateParser<Date>;

  /**
   * Attempts to parse the input into a Date value.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentDateParser<Date> instance to further manipulate the value.
   */
  parsedAsDate(
    errorCode: string,
    errorMessage?: string
  ): FluentDateParser<Date>;

  /**
   * Attempts to parse the input into a Date value.
   * @param parser Custom parsing function used to transform input.
   * @returns A FluentDateParser<Date> instance to further manipulate the value.
   */
  parsedAsDate(parser: (input: T) => Date | undefined): FluentDateParser<Date>;

  /**
   * Attempts to parse the input into a Date value.
   * @param parser Custom parsing function used to transform input.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentDateParser<Date> instance to further manipulate the value.
   */
  parsedAsDate(
    parser: (input: T) => Date | undefined,
    errorCode: string,
    errorMessage?: string
  ): FluentDateParser<Date>;

  /**
   * Attempts to parse the input as a floating-point value.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsFloat(): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as a floating-point value.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsFloat(
    errorCode: string,
    errorMessage?: string
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as a floating-point value.
   * @param parser Custom parsing function used to transform input.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsFloat(
    parser: (input: T) => number | undefined
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as a floating-point value.
   * @param parser Custom parsing function used to transform input.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsFloat(
    parser: (input: T) => number | undefined,
    errorCode: string,
    errorMessage?: string
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as an integer value.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as an integer value.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(
    errorCode: string,
    errorMessage?: string
  ): FluentNumberParser<number>;
  /**
   * Attempts to parse the input as an integer value using the given base.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(base: number): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as an integer value using the given base.
   * @param base
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(
    base: number,
    errorCode: string,
    errorMessage?: string
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as an integer value using the given base.
   * @param parser Custom parsing function used to transform input.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(
    parser: (input: T) => number | undefined
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse the input as an integer value using the given base.
   * @param parser Custom parsing function used to transform input.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentNumberParser<number> instance to further manipulate the value.
   */
  parsedAsInteger(
    parser: (input: T) => number | undefined,
    errorCode: string,
    errorMessage?: string
  ): FluentNumberParser<number>;

  /**
   * Attempts to parse input as a WHATWG URL.
   * @returns A FluentURLParser<URL> to continue the parsing.
   */
  parsedAsURL(): FluentURLParser<URL>;

  /**
   * Attempts to parse input as a WHATWG URL.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentURLParser<URL> to continue the parsing.
   */
  parsedAsURL(errorCode: string, errorMessage?: string): FluentURLParser<URL>;

  /**
   * Attempts to parse input as a WHATWG URL.
   * @param parser Custom parsing function used to transform input.
   * @returns A FluentURLParser<URL> to continue the parsing.
   */
  parsedAsURL(parser: (input: T) => URL | undefined): FluentURLParser<URL>;

  /**
   * Attempts to parse input as a WHATWG URL.
   * @param parser Custom parsing function used to transform input.
   * @param errorCode Custom error code to use.
   * @param errorMessage Custom error message to use.
   * @returns A FluentURLParser<URL> to continue the parsing.
   */
  parsedAsURL(
    parser: (input: T) => URL | undefined,
    errorCode: string,
    errorMessage?: string
  ): FluentURLParser<URL>;

  /**
   * @returns A FluentStringParser<T> that trims leading and trailing whitespace from input during parsing.
   */
  trimmed(): FluentStringParser<string>;

  /**
   * @returns A FluentStringParser<T> that converts inputs to uppercase before validation.
   */
  upperCased(): FluentStringParser<Uppercase<T>>;
}
