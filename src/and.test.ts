import { V } from ".";
import { runValidationTests } from "./test-utils";

describe("allOf()", () => {
  describe("validate()", () => {
    const validator = V.allOf(
      V.isString().minLength(4),
      V.isString().passes(
        (str) => str.toUpperCase() === str,
        "all_uppercase",
        "input must be all uppercase"
      )
    );

    const tests: [
      any,
      boolean,
      (string | string[])?,
      (string | string[])?
    ][] = [
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

    runValidationTests(validator, tests);
  });
});
