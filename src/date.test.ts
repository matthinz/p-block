import { V } from ".";
import { runValidationTests } from "./test-utils";

describe("isDate()", () => {
  const tests: [any, boolean, string?, string?][] = [
    [undefined, false, "invalidType", "input must be a Date"],
    [null, false, "invalidType", "input must be a Date"],
    [false, false, "invalidType", "input must be a Date"],
    [{}, false, "invalidType", "input must be a Date"],
    [
      {
        getDate: () => 1234,
      },
      false,
      "invalidType",
      "input must be a Date",
    ],
    [123456, false, "invalidType", "input must be a Date"],
    ["not a date", false, "invalidType", "input must be a Date"],
    ["2021-04-21T15:59:25.237Z", false, "invalidType", "input must be a Date"],
    [
      new Date("not actually a date"),
      false,
      "invalidDate",
      "input must represent a valid Date",
    ],
    [new Date(2021, 3, 21), true],
  ];

  const validator = V.isDate();

  runValidationTests(validator, tests);
});
