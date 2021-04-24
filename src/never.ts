import { ValidationContext, Validator } from "./types";

export class NeverValidator<Type> implements Validator<Type> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(input: any, _context?: ValidationContext): input is Type {
    return false;
  }
}
