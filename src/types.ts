/**
 * Interface for a validator of the given type.
 */
export interface Validator<Type> {
  /**
   * @param input
   * @returns Whether input validates.
   */
  validate: TypeValidationFunction<any, Type>;
}

export interface UntypedValidator {
  /**
   * @param inputs
   * @returns Whether input validates
   */
  validate: (input: any) => boolean;
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
  prepareContext?: (
    context?: ValidationContext
  ) => ValidationContext | undefined;
}

export type PathElement = string | number;

export type Path = PathElement[];

export interface ValidationContext {
  handleErrors(errors: ValidationErrorDetails[]): false;
  path: Path;
}

export type PrepareValidationContextFunction = (
  context?: ValidationContext
) => ValidationContext | undefined;

export interface ValidationErrorDetails {
  code: string;
  message: string;
  path: (string | number)[];
}

export type ValidationFunction<Type> = (
  input: Type,
  context?: ValidationContext
) => boolean;

export type TypeValidationFunction<InputType, OutputType extends InputType> = (
  input: InputType,
  context?: ValidationContext
) => input is OutputType;

export type NormalizationFunction = (input: any) => any;
