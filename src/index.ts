import { FluentArrayValidator, ArrayValidator } from "./array";
import { FluentNumberValidator, NumberValidator } from "./number";
import { FluentObjectValidator, ObjectValidator } from "./object";
import { FluentStringValidator, StringValidator } from "./string";
import { ObjectWithProperties } from "./types";

export { FluentArrayValidator } from "./array";
export { FluentNumberValidator } from "./number";
export { FluentObjectValidator } from "./object";
export { FluentStringValidator } from "./string";

const arrayValidator: FluentArrayValidator<any> = new ArrayValidator();
const numberValidator: FluentNumberValidator = new NumberValidator();
const objectValidator: FluentObjectValidator<{}> = new ObjectValidator();
const stringValidator: FluentStringValidator = new StringValidator();

export const V = {
  isArray: () => arrayValidator,
  isNumber: () => numberValidator,
  isObject: () => objectValidator,
  isString: () => stringValidator,
};
