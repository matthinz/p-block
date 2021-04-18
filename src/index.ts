import { NumberValidator } from "./number";
import { ObjectValidator } from "./object";
import { StringValidator } from "./string";

const numberValidator = new NumberValidator(undefined, [], []);
const objectValidator = new ObjectValidator(undefined, [], []);
const stringValidator = new StringValidator(undefined, [], []);

export const V = {
  isNumber: () => numberValidator,
  isObject: () => objectValidator,
  isString: () => stringValidator,
};
