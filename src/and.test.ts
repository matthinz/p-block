import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";
import { ParsedType } from "./types";

describe("allOf()", () => {
  describe("string", () => {
    const parser = V.allOf(
      V.string().minLength(4),
      V.string().passes(
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
    const parser = V.allOf(V.string(), V.number());
    const tests: ParsingTest<string & number>[] = [
      [undefined, false, "invalidType"],
      [123, false, "invalidType"],
      ["foo", false, "invalidType"],
    ];
    runParsingTests(parser, tests);
  });

  describe("mixed objects", () => {
    const parser = V.allOf(
      V.object().withProperties({
        name: V.string(),
      }),
      V.object().withProperties({
        age: V.number(),
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
      const lowercase = V.string().lowerCased();
      const uppercase = V.string().upperCased();

      const parser = V.allOf(lowercase, uppercase);

      expect(() => {
        parser.parse("foo");
      }).toThrow(
        "Parsers generated different outputs of the same types that could not be reconciled"
      );
    });
  });
});
