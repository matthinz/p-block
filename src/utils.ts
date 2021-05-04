import {
  NormalizationFunction,
  ParseResult,
  ParsingFunction,
  Path,
  ValidationFunction,
} from "./types";

type ValidatorArgs<Type> =
  | ValidationFunction<Type>
  | ValidationFunction<Type>[]
  | undefined;

type NormalizerArgs<Type> =
  | NormalizationFunction<Type>
  | NormalizationFunction<Type>[]
  | undefined;

export function applyErrorDetails<Type>(
  validator: ValidationFunction<Type>,
  defaultErrorCode: string,
  defaultErrorMessage: string,
  preferredErrorCode?: string,
  preferredErrorMessage?: string
): ValidationFunction<Type> {
  return (input: Type) => {
    const validationResult = validator(input);

    if (validationResult === false) {
      if (preferredErrorCode != null) {
        return {
          code: preferredErrorCode,
          message: preferredErrorMessage ?? preferredErrorCode,
          path: [],
        };
      }

      return {
        code: defaultErrorCode,
        message: defaultErrorMessage ?? defaultErrorCode,
        path: [],
      };
    }

    return validationResult;
  };
}

export function buildParsingFunction<Type>(
  parser: ParsingFunction<Type>,
  normalizer?: NormalizationFunction<Type>,
  validator?: ValidationFunction<Type>
): ParsingFunction<Type> {
  if (!(normalizer || validator)) {
    return parser;
  }

  return (input: unknown): ParseResult<Type> => {
    const initialParseResult = parser(input);
    if (!initialParseResult.success) {
      return initialParseResult;
    }

    const value = normalizer
      ? normalizer(initialParseResult.parsed)
      : initialParseResult.parsed;

    if (!validator) {
      return {
        success: true,
        errors: [],
        parsed: value,
      };
    }

    const validationResult = validator(value);

    if (validationResult === true) {
      return {
        success: true,
        errors: [],
        parsed: value,
      };
    } else if (validationResult === false) {
      throw new Error(
        "Validation failed but no error code could be determined"
      );
    }

    return {
      success: false,
      errors: Array.isArray(validationResult)
        ? validationResult
        : [validationResult],
    };
  };
}

/**
 * Takes a set of things that _could_ normalize an input and returns a single
 * function that applies them all.
 */
export function composeNormalizers<Type>(
  ...normalizers: NormalizerArgs<Type>[]
): NormalizationFunction<Type> {
  function reducer(
    result: NormalizationFunction<Type>,
    normalizer: NormalizerArgs<Type>
  ): NormalizationFunction<Type> {
    if (!normalizer) {
      return result;
    }

    if (Array.isArray(normalizer)) {
      return normalizer.reduce(reducer, result);
    }

    return (input: Type) => normalizer(result(input));
  }

  return normalizers.reduce(reducer, (input: Type) => input);
}

/**
 * Takes a set of things that can be used to validate an input and returns
 * a ValidationFunction that applies them in sequence.
 */
export function composeValidators<Type>(
  ...validators: ValidatorArgs<Type>[]
): ValidationFunction<Type> {
  function reducer(
    result: ValidationFunction<Type>,
    validator: ValidatorArgs<Type>
  ): ValidationFunction<Type> {
    if (!validator) {
      return result;
    }

    if (Array.isArray(validator)) {
      return validator.reduce(reducer, result);
    }

    return function (input: Type) {
      const validationResult = result(input);
      if (validationResult !== true) {
        return validationResult;
      }

      return validator(input);
    };
  }

  return validators.reduce(reducer, () => true);
}

export function pathsEqual(x: Path, y: Path): boolean {
  if (x.length !== y.length) {
    return false;
  }

  if (x.length === 0) {
    return true;
  }
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) {
      return false;
    }
  }

  return true;
}

export function createDefaultParser<Type>(
  type: string | Function // eslint-disable-line
): ParsingFunction<Type> {
  return (input: unknown): ParseResult<Type> => {
    if (typeof type === "string") {
      if (typeof input !== type) {
        return {
          success: false,
          errors: [
            {
              code: "invalidType",
              message: `input must be of type '${type}'`,
              path: [],
            },
          ],
        };
      }
    } else if (!(input instanceof type)) {
      return {
        success: false,
        errors: [
          {
            code: "invalidType",
            message: `input must be an instance of ${type.name}`,
            path: [],
          },
        ],
      };
    }

    return {
      success: true,
      errors: [],
      parsed: input as Type,
    };
  };
}
