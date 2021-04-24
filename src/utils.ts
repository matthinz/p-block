import { Path, ValidationContext, ValidationErrorDetails } from "./types";

export function createTrackingContext(
  errors: ValidationErrorDetails[],
  context?: ValidationContext
): ValidationContext {
  return {
    ...(context ?? { path: [] }),
    handleErrors(newErrors: ValidationErrorDetails[]): false {
      errors.push(...newErrors);
      return false;
    },
  };
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
