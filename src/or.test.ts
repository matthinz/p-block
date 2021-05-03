import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("anyOf()", () => {
  const validator = V.anyOf(V.isString(), V.isNumber(), V.isBoolean());

  const tests: ParsingTest<string | number | boolean>[] = [
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

  runParsingTests(validator, tests);
});
