import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("allOf()", () => {
  const validator = V.allOf(
    V.isString().minLength(4),
    V.isString().passes(
      (str) => str.toUpperCase() === str,
      "all_uppercase",
      "input must be all uppercase"
    )
  );

  const tests: ParsingTest<string>[] = [
    [undefined, false, "invalidType", "input must be of type 'string'"],
    [
      "foo",
      false,
      ["minLength", "all_uppercase"],
      [
        "input length must be greater than or equal to 4 character(s)",
        "input must be all uppercase",
      ],
    ],
  ];

  runParsingTests(validator, tests);
});
