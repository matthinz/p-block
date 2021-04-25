/**
 * Interface for a validator of the given type.
 */
export interface Validator<Type> {
  parse(input: any): ParseResult<Type>;

  /**
   * @param input
   * @returns Whether input validates.
   */
  validate: TypeValidationFunction<any, Type>;

  TEMPORARY_validateAndThrow: TypeValidationFunction<any, Type>;
}

export interface FluentValidator<Type> extends Validator<Type>, Normalizer {
  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators:
      | ValidationFunction<Type>
      | Validator<Type>
      | (ValidationFunction<Type> | Validator<Type>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentValidator<Type>;
}

export interface Normalizer {
  /**
   * @param input
   * @returns `input` with normalization rules applied.
   */
  normalize: NormalizationFunction;
}

export interface ValidatorOptions {
  errorCode: string;
  errorMessage: string | ((input: any) => string);
}

export type PathElement = string | number;

export type Path = PathElement[];

export interface ValidationErrorDetails {
  code: string;
  message: string;
  path: (string | number)[];
}

export type ValidationFunction<Type> = (
  input: Type
) => boolean | ValidationErrorDetails | ValidationErrorDetails[];

/**
 * A function that makes a type assertion and optionally reports errors
 * by adding them to `errors`.
 */
export type TypeValidationFunction<InputType, OutputType extends InputType> = (
  input: InputType,
  errors?: ValidationErrorDetails[]
) => input is OutputType;

export type NormalizationFunction = (input: any) => any;

export type ParseResult<Type> =
  | {
      success: true;
      errors: [];
      parsed: Type;
    }
  | { success: false; errors: ValidationErrorDetails[] };
