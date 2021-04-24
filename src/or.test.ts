import { V } from ".";
import { runValidationTests } from "./test-utils";

describe("any()", () => {
  describe("validate()", () => {
    const validator = V.anyOf(V.isString(), V.isNumber(), V.isBoolean());

    const tests: [any, boolean, string?, string?][] = [
      [
        undefined,
        false,
        "invalidType",
        "input must be of type 'string' OR input must be of type 'number' OR input must be of type 'boolean'",
      ],
      [
        null,
        false,
        "invalidType",
        "input must be of type 'string' OR input must be of type 'number' OR input must be of type 'boolean'",
      ],
      ["", true],
      [123, true],
      [false, true],
    ];

    runValidationTests(validator, tests);
  });
});
