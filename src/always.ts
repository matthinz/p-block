import { Parser } from "./types";

export class AlwaysValidator<Type> implements Parser<Type> {
  parse(input: any): { success: true; parsed: Type; errors: [] } {
    return { success: true, parsed: input as Type, errors: [] };
  }
}
