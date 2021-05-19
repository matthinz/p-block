import { NormalizationFunction, Path, ValidationFunction } from "./types";

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
