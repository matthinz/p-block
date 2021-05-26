import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("boolean()", () => {
  describe("stock", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType", "input must be of type 'boolean'"],
      [null, false, "invalidType", "input must be of type 'boolean'"],
      [{}, false, "invalidType", "input must be of type 'boolean'"],
      [0, false, "invalidType", "input must be of type 'boolean'"],
      [true, true],
      [false, true],
    ];
    runParsingTests(P.boolean(), tests);
  });

  describe("defaultedTo()", () => {
    const parser = P.boolean().defaultedTo(false);

    const tests: ParsingTest<boolean>[] = [
      [undefined, true, false],
      [null, true, false],
      [0, false, "invalidType"],
      [1, false, "invalidType"],
      [{}, false, "invalidType"],
      [[], false, "invalidType"],
    ];

    runParsingTests(parser, tests);
  });

  describe("isFalse()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [true, false, "isFalse", "input must be false"],
      [false, true],
    ];
    runParsingTests(P.boolean().isFalse(), tests);
  });

  describe("isTrue()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [false, false, "isTrue", "input must be true"],
      [true, true],
    ];
    runParsingTests(P.boolean().isTrue(), tests);
  });

  describe("normalizedWith()", () => {
    const tests: ParsingTest<boolean>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [false, true, true],
      [true, true, false],
    ];
    runParsingTests(
      P.boolean().normalizedWith((input) => !input),
      tests
    );
  });

  describe("passes()", () => {
    describe("with Parser<boolean>", () => {
      const tests: ParsingTest<boolean>[] = [
        [undefined, false, "invalidType"],
        [true, true],
        [false, false, "isTrue"],
      ];
      runParsingTests(P.boolean().passes(P.boolean().isTrue()), tests);
    });
  });
});
