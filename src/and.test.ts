import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";
import { ParsedType } from "./types";

describe("allOf()", () => {
  describe("string", () => {
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

  describe("string + number", () => {
    const parser = V.allOf(V.isString(), V.isNumber());
    const tests: ParsingTest<string & number>[] = [
      [undefined, false, "invalidType"],
      [123, false, "invalidType"],
      ["foo", false, "invalidType"],
    ];
    runParsingTests(parser, tests);
  });

  describe("mixed objects", () => {
    const parser = V.allOf(
      V.isObject().withProperties({
        name: V.isString(),
      }),
      V.isObject().withProperties({
        age: V.isNumber(),
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
      const lowercase = V.isString().lowerCased();
      const uppercase = V.isString().upperCased();

      const parser = V.allOf(lowercase, uppercase);

      expect(() => {
        parser.parse("foo");
      }).toThrow(
        "Parsers generated different outputs of the same types that could not be reconciled"
      );
    });
  });
});
