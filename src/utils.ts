import {
  NormalizationFunction,
  ParseResult,
  Path,
  PathElement,
  ValidationErrorDetails,
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

export const EMPTY_PATH: ReadonlyArray<PathElement> = Object.freeze([]);

export const NO_ERRORS: [] = Object.freeze([]) as [];

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

export function combineErrorLists(
  errorLists: ReadonlyArray<ValidationErrorDetails>[],
  merger: (
    x: ValidationErrorDetails,
    y: ValidationErrorDetails
  ) => ValidationErrorDetails | ValidationErrorDetails[]
): ReadonlyArray<ValidationErrorDetails> {
  return errorLists.reduce(reducer, []);

  function reducer(
    result: ValidationErrorDetails[],
    errors: ReadonlyArray<ValidationErrorDetails>
  ): ValidationErrorDetails[] {
    errors.forEach((err) => {
      const index = result.findIndex(
        (e) => e.code === err.code && pathsEqual(e.path, err.path)
      );
      if (index < 0) {
        result.push(err);
        return result;
      }

      const merged = merger(result[index], err);

      if (Array.isArray(merged)) {
        result.splice(index, 1, ...merged);
      } else {
        result[index] = merged;
      }
    });

    return result;
  }
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

export function createFailedParseResult<T>(
  errorCode: string,
  errorMessage: string
): ParseResult<T> {
  return Object.freeze({
    success: false,
    errors: Object.freeze([
      Object.freeze({
        code: errorCode,
        message: errorMessage,
        path: EMPTY_PATH,
      }),
    ]),
  });
}

export function createInvalidTypeParseResult<T>(
  message: string
): ParseResult<T> {
  return createFailedParseResult<T>("invalidType", message);
}

export function deepFreeze<T>(obj: T): T {
  if (typeof Object.freeze !== "function") {
    return obj;
  }

  if (obj == null) {
    return obj;
  }

  Object.freeze(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (item != null && typeof item === "object") {
        deepFreeze(item);
      }
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      deepFreeze((obj as any)[key]);
    });
  }

  return obj;
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

export function resolveErrorDetails(
  defaultErrorCode: string,
  defaultErrorMessage: string,
  providedErrorCode?: string,
  providedErrorMessage?: string
): [string, string] {
  if (providedErrorCode === undefined) {
    return [defaultErrorCode, defaultErrorMessage];
  }
  return [providedErrorCode, providedErrorMessage ?? providedErrorCode];
}
