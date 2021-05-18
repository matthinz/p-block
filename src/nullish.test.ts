import { V } from "../src";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("nullish()", () => {
  const parser = V.nullish();
  const tests: ParsingTest<undefined>[] = [
    [undefined, true, undefined],
    [null, true, undefined],
    ["", false, "invalidType", "input must be null or undefined"],
    [false, false, "invalidType", "input must be null or undefined"],
  ];
  runParsingTests(parser, tests);
});
