import { Validator } from "./types";

export class AlwaysValidator<Type> implements Validator<Type> {
  normalize(input: Type) {
    return input;
  }
  parse(input: any): { success: true; parsed: Type; errors: [] } {
    return { success: true, parsed: input as Type, errors: [] };
  }
  validate(input: any): input is Type {
    return true;
  }
}
