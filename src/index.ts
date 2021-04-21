import { FluentArrayValidator, ArrayValidator } from "./array";
import { FluentBooleanValidator, BooleanValidator } from "./boolean";
import { FluentNumberValidator, NumberValidator } from "./number";
import { FluentObjectValidator, ObjectValidator } from "./object";
import { FluentStringValidator, StringValidator } from "./string";

export { FluentArrayValidator } from "./array";
export { FluentBooleanValidator } from "./boolean";
export { FluentNumberValidator } from "./number";
export { FluentObjectValidator } from "./object";
export { FluentStringValidator } from "./string";

const arrayValidator: FluentArrayValidator<any> = new ArrayValidator();
const booleanValidator: FluentBooleanValidator = new BooleanValidator();
const numberValidator: FluentNumberValidator = new NumberValidator();
const objectValidator: FluentObjectValidator<{}> = new ObjectValidator();
const stringValidator: FluentStringValidator = new StringValidator();

export const V = {
  isArray: () => arrayValidator,
  isBoolean: () => booleanValidator,
  isNumber: () => numberValidator,
  isObject: () => objectValidator,
  isString: () => stringValidator,
};
