import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";
import { ParsedType } from "./types";

describe("allOf()", () => {
  describe("string", () => {
    const parser = P.allOf(
      P.string().minLength(4),
      P.string().passes(
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

    runParsingTests(parser, tests);
  });

  describe("string + number", () => {
    const parser = P.allOf(P.string(), P.number());
    const tests: ParsingTest<string & number>[] = [
      [undefined, false, "invalidType"],
      [123, false, "invalidType"],
      ["foo", false, "invalidType"],
    ];
    runParsingTests(parser, tests);
  });

  describe("mixed objects", () => {
    const parser = P.allOf(
      P.object().withProperties({
        name: P.string(),
      }),
      P.object().withProperties({
        age: P.number(),
      })
    );

    type T = ParsedType<typeof parser>;

    const tests: ParsingTest<T>[] = [
      [undefined, false, "invalidType"],
      ["foo", false, "invalidType"],
      [{ name: "Joe" }, false],
      [{ name: "Joe", age: 27 }, true],
    ];

    runParsingTests(parser, tests);
  });

  describe("weird behaviors", () => {
    test("strings w/ different normalizations throws", () => {
      const lowercase = P.string().lowerCased();
      const uppercase = P.string().upperCased();

      const parser = P.allOf(lowercase, uppercase);

      expect(() => {
        parser.parse("foo");
      }).toThrow(
        "Parsers generated different outputs of the same types that could not be reconciled"
      );
    });
  });
});
