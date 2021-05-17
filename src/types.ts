/**
 * Result of attempting to parse an unknown input.
 * Indicates either a successful parse (in which case `success` will be `true`
 * and `parsed` will contain the strongly-typed data) or an unsuccessful parse
 * (`success` will be `false` and `errors` will contain the set of
 * errors encountered during parsing).
 */
export type ParseResult<Type> =
  | {
      success: true;
      errors: [];
      parsed: Type;
    }
  | { success: false; errors: ValidationErrorDetails[] };

/**
 * Function responsible for taking unknown input and attempting to parse it
 * into a known, strongly-typed result.
 * @param input
 */
export type ParsingFunction<Type> = (input: unknown) => ParseResult<Type>;

export interface Parser<Type> {
  readonly parse: ParsingFunction<Type>;
}

export type ParserMap = {
  [property: string]: Parser<any>;
};

export type ExtendObjectType<
  Type extends Record<string, unknown>,
  Properties extends ParserMap
> = Type &
  {
    [property in keyof Properties]: ParsedType<Properties[property]>;
  };

export interface FluentParser<Type> extends Parser<Type> {
  /**
   * @param value
   * @returns A parser, derived from this one, that will fill in the given default value when input is null or undefined.
   */
  defaultedTo(value: Type): FluentParser<Type>;

  normalizedWith(
    ...normalizers: (
      | NormalizationFunction<Type>
      | NormalizationFunction<Type>[]
    )[]
  ): FluentParser<Type>;

  /**
   * @returns A new Parser that will accept `undefined` or `null` as valid input. (`null` will always be
   * normalized to `undefined`).
   */
  optional(): FluentParser<Type | undefined>;

  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentParser<Type>;
}

export type UnionToIntersection<Type> = (
  Type extends any ? (x: Type) => any : never
) extends (x: infer Result) => any
  ? Result
  : never;

export interface FluentParsingRoot {
  allOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParser<UnionToIntersection<ParsedType<Parsers[number]>>>;
  anyOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParser<ParsedType<Parsers[number]>>;
  isArray(): FluentArrayParser<unknown>;
  isBoolean(): FluentBooleanParser;
  isDate(): FluentDateParser;
  /**
   * @returns A FluentNumberParser that truncates any decimal portion of the input.
   */
  isInteger(): FluentNumberParser;
  isNullish(): FluentParser<undefined>;
  isNumber(): FluentNumberParser;
  isObject(): FluentObjectParser<Record<string, unknown>>;
  isString(): FluentStringParser;
  isUnknown(): FluentParser<unknown>;
  isURL(): FluentURLParser;
}

export interface FluentArrayParser<ItemType> extends FluentParser<ItemType[]> {
  allItemsPass(
    validators: ValidationFunction<ItemType> | ValidationFunction<ItemType>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType>;

  defaultedTo(value: ItemType[]): FluentArrayParser<ItemType>;

  /**
   * Normalizes the input array by filtering it.
   *
   * @param predicate
   */
  filtered(
    predicate: (item: ItemType, index: number, array: ItemType[]) => boolean
  ): FluentArrayParser<ItemType>;

  mapped<NextItemType>(
    callback: (item: ItemType, index: number, array: ItemType[]) => NextItemType
  ): FluentParser<NextItemType[]>;

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType>;

  minLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType>;

  /**
   * @returns A new parser, derived from this one, that runs a further type check on its items.
   */
  of<NextItemType extends ItemType>(
    parser: Parser<NextItemType>
  ): FluentArrayParser<NextItemType>;
}

export interface FluentBooleanParser extends FluentParser<boolean> {
  defaultedTo(value: boolean): FluentBooleanParser;
  isFalse(errorCode?: string, errorMessage?: string): FluentBooleanParser;
  isTrue(errorCode?: string, errorMessage?: string): FluentBooleanParser;
  normalizedWith(
    ...normalizers: (
      | NormalizationFunction<boolean>
      | NormalizationFunction<boolean>[]
    )[]
  ): FluentBooleanParser;
  passes(
    validators: ValidationFunction<boolean> | ValidationFunction<boolean>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanParser;
}

export interface FluentDateParser extends FluentParser<Date> {
  between(
    inclusiveMinimum: Date,
    inclusiveMaximum: Date,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is equal to a given value.
   */
  equalTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is greater than a given value.
   */
  greaterThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is greater than or equal to a given value.
   */
  greaterThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is less than a given value.
   */
  lessThan(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is less than or equal to a given value.
   */
  lessThanOrEqualTo(
    value: Date | (() => Date),
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;
}

export interface FluentNumberParser extends FluentParser<number> {
  between(
    inclusiveMinimum: number,
    inclusiveMaximum: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is equal to a given value.
   */
  equalTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is greater than a given value.
   */
  greaterThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is greater than or equal to a given value.
   */
  greaterThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is less than a given value.
   */
  lessThan(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param value
   * @param errorCode
   * @param errorMessage
   * @returns A new parser, derived from this one, that validates input is less than or equal to a given value.
   */
  lessThanOrEqualTo(
    value: number | (() => number),
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  /**
   * @param decimalPlaces
   * @returns A new FluentNumberParser, derived from this one, that rounds its input to the given number of decimal places before validating.
   */
  roundedTo(decimalPlaces: number): FluentNumberParser;

  /**
   * @returns A new FluentNumberParser, derived from this one, that truncates the decimal portion of its input before validation.
   */
  truncated(): FluentNumberParser;
}

export interface FluentObjectParser<Type extends Record<string, unknown>>
  extends FluentParser<Type> {
  defaultedTo(values: Partial<Type>): FluentObjectParser<Type>;

  propertiesMatch<
    PropertyName extends keyof Type,
    OtherPropertyName extends Exclude<keyof Type, PropertyName> &
      Type[PropertyName]
  >(
    propertyName: PropertyName,
    otherPropertyName: OtherPropertyName,
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectParser<Type>;

  propertyPasses<PropertyName extends keyof Type>(
    propertyName: PropertyName,
    validators:
      | PropertyValidationFunction<Type[typeof propertyName], Type>
      | PropertyValidationFunction<Type[typeof propertyName], Type>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentObjectParser<Type>;

  withProperties<
    PropertyParsers extends {
      [property: string]: Parser<any>;
    }
  >(
    properties: PropertyParsers
  ): FluentObjectParser<
    Type &
      {
        [property in keyof PropertyParsers]: ParsedType<
          PropertyParsers[property]
        >;
      }
  >;
}

export interface FluentStringParser extends FluentParser<string> {
  /**
   * @returns A FluentStringValidator, derived from this one, that validates its input is included in `values`. This check is strict--case matters.
   */
  isIn(
    values: string[],
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser;

  length(length: number): FluentStringParser;

  /**
   * @returns A FluentStringParser that converts input to lower case before validating.
   */
  lowerCased(): FluentStringParser;

  matches(
    regex: RegExp,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser;

  maxLength(
    max: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser;

  minLength(
    min: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentStringParser;

  notEmpty(errorCode?: string, errorMessage?: string): FluentStringParser;

  parsedAsBoolean(
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanParser;

  parsedAsBoolean(
    parser?: (input: string) => boolean | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentBooleanParser;

  parsedAsDate(
    parser?: (input: string) => Date | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentDateParser;

  parsedAsFloat(
    parser: (input: string) => number | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  parsedAsFloat(errorCode?: string, errorMessage?: string): FluentNumberParser;

  parsedAsInteger(
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  parsedAsInteger(
    base: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  parsedAsInteger(
    parser: (input: string) => number | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentNumberParser;

  parsedAsURL(errorCode?: string, errorMessage?: string): FluentURLParser;

  parsedAsURL(
    parser: (input: string) => URL | undefined,
    errorCode?: string,
    errorMessage?: string
  ): FluentURLParser;

  /**
   * @returns A FluentStringParser, derived from this one, that trims leading and trailing whitespace from input before validation.
   */
  trimmed(): FluentStringParser;

  /**
   * @returns A FluentStringParser, derived from this one, that converts inputs to uppercase before validation.
   */
  upperCased(): FluentStringParser;
}

export type KnownProtocol = "http:" | "https:" | "ftp:" | "mailto:";

export interface FluentURLParser extends FluentParser<URL> {
  /**
   * Validates that the incoming URL is using the HTTP or HTTPS protocol.
   */
  httpOrHttpsOnly(errorCode?: string, errorMessage?: string): FluentParser<URL>;

  /**
   * Validates that the incoming URL is using the HTTPS protocol.
   */
  httpsOnly(errorCode?: string, errorMessage?: string): FluentParser<URL>;

  /**
   * Validates that the incoming URL uses the given protocol. If more than
   * one is specified, validation will pass if the URL uses any of them.
   */
  protocolEqualTo(
    protocol: KnownProtocol | string | (KnownProtocol | string)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentParser<URL>;
}

/**
 * Utility type used to extract the type produced by a parser.
 */
export type ParsedType<ParserType> = ParserType extends Parser<infer Type>
  ? Type
  : never;

/**
 * Normalization takes strongly-typed input and performs an additional pass on
 * it, for example to remove leading and trailing whitespace from a string.
 * NormalizationFunctions *cannot* change the type of the input--use a
 * `ParsingFunction` for that.
 */
export type NormalizationFunction<Type> = (input: Type) => Type;

/**
 * Validation takes a strongly-typed input and returns one of the following:
 * - `true` if validation passes
 * - `false` if validation fails
 * - One or more `ValidationErrorDetails` objects describing the validation
 *   error(s) that occurred.
 *
 * Where possible, you should avoid returning `false` on validation failure.
 * If the system cannot determine the correct error code to use for reporting
 * the validation failure, an Error may be thrown.
 */
export type ValidationFunction<Type> = (
  input: Type
) => boolean | ValidationErrorDetails | ValidationErrorDetails[];

export type PropertyValidationFunction<
  PropertyType,
  ObjectType extends Record<string, unknown>
> = (
  value: PropertyType,
  object: ObjectType
) => boolean | ValidationErrorDetails | ValidationErrorDetails[];

export type PathElement = string | number | symbol;

export type Path = ReadonlyArray<PathElement>;

export interface ValidationErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly path: Path;
}
