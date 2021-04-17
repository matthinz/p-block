type ObjectWithProperties = object & { [property: string]: any };

type PropertyIs<PropertyName extends string, PropertyType> = {
  [property in PropertyName]: PropertyType;
};

type ValidationFunction<Type> = (
  input: Type,
  context?: ValidationContext
) => boolean;

type TypeValidationFunction<InputType, OutputType extends InputType> = (
  input: InputType,
  context?: ValidationContext
) => input is OutputType;

type Normalizer<Type> = (input: Type) => Type;

export interface ValidationError extends Error {
  code: string;
  path: (string | number)[];
}

interface ValidatorOptions {
  errorCode: string;
  errorMessage: string;
  path: (string | number)[];
  prepareContext?: (
    context?: ValidationContext
  ) => ValidationContext | undefined;
}

interface ValidationContext {
  createError(
    errorCode: string,
    errorMessage: string,
    path: (string | number)[]
  ): ValidationError | undefined;
}

const defaultOptions: ValidatorOptions = {
  errorCode: "invalid",
  errorMessage: "input was invalid",
  path: [],
};

function createNoError(
  errorCode: string,
  errorMessage: string,
  path: (string | number)[]
) {
  return undefined;
}

function createDefaultError(
  errorCode: string,
  errorMessage: string,
  path: (string | number)[]
): ValidationError {
  const err: any = new Error(errorMessage);
  err.code = errorCode;
  err.path = path;
  return err;
}

/**
 * Validator that asserts an input is of a a specific type.
 */
class BasicValidator<Type> {
  private parent?: BasicValidator<Type> | TypeValidationFunction<any, Type>;
  private normalizers: Normalizer<Type>[];
  private validators: ValidationFunction<Type>[];
  protected options: ValidatorOptions;

  constructor(
    parent: BasicValidator<Type> | TypeValidationFunction<any, Type>,
    normalizers: Normalizer<Type> | Normalizer<Type>[],
    validators: ValidationFunction<Type> | ValidationFunction<Type>[],
    options?: ValidatorOptions
  ) {
    this.parent = parent;
    this.normalizers = Array.isArray(normalizers) ? normalizers : [normalizers];
    this.validators = Array.isArray(validators) ? validators : [validators];
    this.options =
      options == null
        ? defaultOptions
        : {
            ...defaultOptions,
            ...options,
          };
  }

  /**
   * @param normalizer
   */
  filtered(...normalizers: Normalizer<Type>[]): BasicValidator<Type> {
    return new BasicValidator<Type>(this, normalizers, []);
  }

  /**
   * Given a strongly-typed input, applies all configured normalizations.
   * @param input
   * @returns Normalized version of `input`.
   */
  normalize(input: Type): Type {
    if (this.parent instanceof BasicValidator) {
      input = this.parent.normalize(input);
    }
    return this.normalizers.reduce(
      (result, normalizer) => normalizer(result),
      input
    );
  }

  /**
   * @returns A new BasicValidator that performs an additional check on its input beyond a basic type check.
   */
  passes(
    validator: ValidationFunction<Type>,
    errorCode: string = "invalid",
    errorMessage: string = "input was invalid"
  ): BasicValidator<Type> {
    return new BasicValidator(this, [], [validator], {
      ...this.options,
      errorCode,
      errorMessage,
    });
  }

  /**
   * @returns A new Validator configured to throw on validation errors.
   */
  shouldThrow(): BasicValidator<Type> {
    return new BasicValidator<Type>(this, [], [], {
      ...this.options,
      prepareContext: (
        context?: ValidationContext
      ): ValidationContext | undefined => {
        context = this.options.prepareContext
          ? this.options.prepareContext(context)
          : context;

        return {
          createError: createDefaultError,
        };
      },
    });
  }

  /**
   * @returns true if `input` is `Type`.
   */
  validate(input: any, context?: ValidationContext): input is Type {
    context = this.options.prepareContext
      ? this.options.prepareContext(context)
      : context;

    const { parent } = this;

    if (parent instanceof BasicValidator) {
      if (!parent.validate(input, context)) {
        return false;
      }
    } else if (typeof parent === "function") {
      if (!parent(input, context)) {
        return false;
      }
    } else {
      throw new Error("parent was not a BasicValidator or a function");
    }

    input = this.normalize(input);

    const passesChecks = this.validators.reduce<boolean>(
      (isValid, validator) => isValid && validator(input, context),
      true
    );

    if (passesChecks) {
      return true;
    }

    const err = context
      ? context.createError(
          this.options.errorCode,
          this.options.errorMessage,
          this.options.path
        )
      : undefined;

    if (err) {
      throw err;
    }

    return false;
  }
}

class StringValidator extends BasicValidator<string> {
  constructor(
    parent: TypeValidationFunction<any, string> | StringValidator,
    normalizers: Normalizer<string> | Normalizer<string>[],
    validators: ValidationFunction<string> | ValidationFunction<string>[],
    options?: ValidatorOptions
  ) {
    super(parent, normalizers, validators, options);
  }

  lowerCased(): StringValidator {
    return new StringValidator(
      this,
      (str) => str.toLowerCase(),
      [],
      this.options
    );
  }

  /**
   * @param regex
   * @param errorCode
   * @param errorMessage
   * @returns A new StringValidator configured to check inputs against the given regular expression.
   */
  matches(
    regex: RegExp,
    errorCode?: string,
    errorMessage?: string
  ): StringValidator {
    return this.passes(
      (input) => regex.test(input),
      errorCode ?? "matches",
      errorMessage ?? `input must match regular expression ${regex}`
    );
  }

  /**
   * @param max Maximum length (inclusive) to be considered valid input.
   * @param errorCode Code for any errors generated by validation.
   * @param errorMessage Message for any errors generated by validation.
   * @returns A new validator that requires input to be at most `max` characters long.
   */
  maxLength(max: number, errorCode?: string, errorMessage?: string) {
    return this.passes(
      (input) => input.length <= max,
      errorCode ?? "maxLength",
      errorMessage ??
        `input length must be less than or equal to ${max} character(s)`
    );
  }

  /**
   * @param max Maximum length (inclusive) to be considered valid input.
   * @param errorCode Code for any errors generated by validation.
   * @param errorMessage Message for any errors generated by validation.
   * @returns A new validator that requires input to be at most `max` characters long.
   */
  minLength(min: number, errorCode?: string, errorMessage?: string) {
    return this.passes(
      (input) => input.length >= min,
      errorCode ?? "minLength",
      errorMessage ??
        `input length must be greater than or equal to ${min} character(s)`
    );
  }

  /**
   *
   * @param errorCode
   * @param errorMessage
   * @returns A StringValidator that will check that a string is not empty.
   */
  notEmpty(errorCode?: string, errorMessage?: string) {
    return this.minLength(
      1,
      errorCode ?? "notEmpty",
      errorMessage ?? "input cannot be an empty string"
    );
  }

  /**
   * @param check
   * @param errorCode
   * @param errorMessage
   * @returns A new StringValidator configured to perform an additional check.
   */
  passes(
    validator: (input: string) => boolean,
    errorCode?: string,
    errorMessage?: string
  ): StringValidator {
    return new StringValidator(this, [], validator, {
      ...this.options,
      errorCode: errorCode ?? "invalid",
      errorMessage: errorMessage ?? "input was invalid",
    });
  }

  /**
   * @returns A StringValidator that removes leading and trailing whitespace during the normalization phase.
   */
  trimmed(): StringValidator {
    return new StringValidator(
      this,
      (input: string) => input.trim(),
      [],
      this.options
    );
  }

  upperCased(): StringValidator {
    return new StringValidator(
      this,
      (str) => str.toUpperCase(),
      [],
      this.options
    );
  }
}

const isNumber = new BasicValidator<number>(
  (input: any): input is number => typeof input === "number",
  [],
  []
);

const isString = new StringValidator(
  function (input: any, context?: ValidationContext): input is string {
    if (typeof input === "string") {
      return true;
    }
    if (context) {
      const err = context.createError("isString", "input must be a string", []);
      if (err) {
        throw err;
      }
    }
    return false;
  },
  [],
  []
);

export class Validator {
  isNumber() {
    return isNumber;
  }
  isString() {
    return isString;
  }
}

export const V = new Validator();
