/**
 * Function responsible for taking unknown input and attempting to parse it
 * into a known, strongly-typed result.
 * @param input
 */
export type ParsingFunction<Type> = (input: unknown) => ParseResult<Type>;

/**
 * Result of calling a ParsingFunction<Type>.
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
 * Object-oriented wrapper around a ParsingFunction.
 */
export interface Parser<Type> {
  readonly parse: ParsingFunction<Type>;
}

export interface FluentParser<Type, FluentParserInterface extends Parser<Type>>
  extends Parser<Type> {
  normalizedWith(
    ...normalizers: (
      | NormalizationFunction<Type>
      | NormalizationFunction<Type>[]
    )[]
  ): FluentParserInterface;

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
  ): FluentParserInterface;
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
