import { TypeValidationFunction, ValidationContext, Validator } from "./types";

export class AlwaysValidator<Type> implements Validator<Type> {
  TEMPORARY_validateAndThrow(input: any): input is Type {
    return true;
  }
  validate(input: any): input is Type {
    return true;
  }
}
