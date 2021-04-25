import {
  FluentValidator,
  NormalizationFunction,
  ParseResult,
  TypeValidationFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
} from "./types";

function createTypeValidator<Type>(
  type: string
): TypeValidationFunction<any, Type> {
  return function validateType(
    input: any,
    errors?: ValidationErrorDetails[]
  ): input is Type {
    if (typeof input === type) {
      return true;
    }

    if (errors) {
      errors.push({
        code: "invalidType",
        message: `input must be of type '${type}'`,
        path: [],
      });
    }

    return false;
  };
}

export abstract class BasicValidator<Type> {
  private readonly parent: Validator<Type> | TypeValidationFunction<any, Type>;
  private readonly normalizers: NormalizationFunction[];
  private readonly validator?: ValidationFunction<Type> | Validator<Type>;

  constructor(
    parent: Validator<Type> | TypeValidationFunction<any, Type> | string,
    normalizers?: NormalizationFunction | NormalizationFunction[],
    validator?: ValidationFunction<Type> | Validator<Type>
  ) {
    this.parent =
      typeof parent === "string" ? createTypeValidator<Type>(parent) : parent;
    this.normalizers = normalizers
      ? Array.isArray(normalizers)
        ? normalizers
        : [normalizers]
      : [];
    this.validator = validator;
  }

  /**
   * Given an, applies all configured normalizations.
   * @param input
   * @returns Normalized version of `input`.
   */
  normalize(input: any): any {
    if (this.parent instanceof BasicValidator) {
      input = this.parent.normalize(input);
    }

    return this.normalizers.reduce(
      (result, normalizer) => normalizer(result),
      input
    );
  }

  /**
   * @returns A validator that will check for `undefined` or the configured type.
   */
  optional(): FluentValidator<Type | undefined> {
    throw new Error();
  }

  parse(input: unknown): ParseResult<Type> {
    input = this.normalize(input);

    const { parent, validator } = this;
    let parsed: Type;

    if (typeof parent === "function") {
      const parentErrors: ValidationErrorDetails[] = [];
      if (parent(input, parentErrors)) {
        parsed = input;
      } else {
        if (parentErrors.length === 0) {
          throw new Error(
            "TypeValidationFunction did not provide error details"
          );
        }
        return {
          success: false,
          errors: parentErrors,
        };
      }
    } else {
      const parentResult = parent.parse(input);
      if (!parentResult.success) {
        return parentResult;
      }
      parsed = parentResult.parsed;
    }

    if (!validator) {
      return {
        success: true,
        errors: [],
        parsed,
      };
    }

    if (typeof validator === "function") {
      const validationResult = validator(parsed);
      if (validationResult === true) {
        return {
          success: true,
          errors: [],
          parsed,
        };
      } else if (validationResult === false) {
        throw new Error("Validator did not provide error details");
      } else if (Array.isArray(validationResult)) {
        return {
          success: false,
          errors: validationResult,
        };
      } else {
        return {
          success: false,
          errors: [validationResult],
        };
      }
    }

    return validator.parse(parsed);
  }

  TEMPORARY_validateAndThrow(input: any): input is Type {
    return this.validate(input);
  }

  validate(input: any): input is Type {
    const { success } = this.parse(input);
    return success;
  }
}
