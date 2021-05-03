/**
 * Function responsible for taking unknown input and attempting to parse it
 * into a known, strongly-typed state.
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

/**
 * Normalization takes strongly-typed input and performs an additional pass on
 * it, for example to remove leading and trailing whitespace from a string.
 * NormalizationFunctions *cannot* change the type of the input--use a
 * `ParsingFunction` for that.
 */
export type NormalizationFunction<Type> = (input: Type) => Type;

/**
 * Object-oriented wrapper around a ParsingFunction.
 */
export interface Normalizer<Type> {
  readonly normalize: NormalizationFunction<Type>;
}

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

export interface Validator<Type> extends Parser<Type> {
  /**
   * Performs a type assertion on the given input.
   * @param input
   */
  validate(input: unknown): input is Type;
}

export type PathElement = string | number;

export type Path = ReadonlyArray<PathElement>;

export interface ValidationErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly path: Path;
}

export interface FluentValidator<Type>
  extends Normalizer<Type>,
    Validator<Type>,
    Parser<Type> {}

export type NormalizerArgs<Type> =
  | undefined
  | NormalizationFunction<Type>
  | Normalizer<Type>
  | (NormalizationFunction<Type> | Normalizer<Type>)[];

export type ValidatorArgs<Type> =
  | undefined
  | ValidationFunction<Type>
  | Validator<Type>
  | (ValidationFunction<Type> | Validator<Type>)[];
