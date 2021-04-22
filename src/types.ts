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
   * @returns A new FluentValidator that requires both `this` and `validator` to pass.
   */
  and<OtherType>(
    validator: Validator<OtherType>
  ): FluentValidator<Type & OtherType>;

  normalizedWith(
    normalizer: NormalizationFunction | NormalizationFunction[]
  ): FluentValidator<Type>;

  /**
   * @returns A new FluentValidator that requires either `this` or `validator` to pass.
   */
  or<OtherType>(
    validator: Validator<OtherType>
  ): FluentValidator<Type | OtherType>;

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
