import { Validator } from "./types";

export class AlwaysValidator<Type> implements Validator<Type> {
  parse(input: any): { success: true; parsed: Type; errors: [] } {
    return { success: true, parsed: input as Type, errors: [] };
  }
  TEMPORARY_validateAndThrow(input: any): input is Type {
    return true;
  }
  validate(input: any): input is Type {
    return true;
  }
}
