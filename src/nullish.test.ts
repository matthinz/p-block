import { V } from "../src";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isNullish()", () => {
  const parser = V.isNullish();
  const tests: ParsingTest<undefined>[] = [
    [undefined, true, undefined],
    [null, true, undefined],
    ["", false, "invalidType", "input must be null or undefined"],
    [false, false, "invalidType", "input must be null or undefined"],
  ];
  runParsingTests(parser, tests);
});
