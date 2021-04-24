import { Validator } from "./types";

export class AlwaysValidator<Type> implements Validator<Type> {
  validate(input: any): input is Type {
    return true;
  }
}
