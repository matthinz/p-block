import { Parser, Path } from "./types";

// cspell:ignore arrayify

export type ParsingTest<Type> =
  | [unknown, true, Type?]
  | [
      unknown,
      false,
      (string | string[])?,
      (string | string[])?,
      (Path | Path[])?
    ];

export type ParsingTestWithParser<Type> =
  | [Parser<Type>, unknown, true, Type?]
  | [
      Parser<Type>,
      unknown,
      false,
      (string | string[])?,
      (string | string[])?,
      (Path | Path[])?
    ];

export function runParsingTests<Type>(
  parserOrTests: Parser<Type> | ParsingTestWithParser<Type>[],
  tests?: ParsingTest<Type>[]
): void {
  const testsWithParser: ParsingTestWithParser<Type>[] = Array.isArray(
    parserOrTests
  )
    ? parserOrTests
    : (tests ?? []).map((test) => [parserOrTests, ...test]);

  describe("parse()", () => {
    testsWithParser.forEach((testParams) => {
      const [parser, input] = testParams;

      describe(stringify(input), () => {
        const parseResult = parser.parse(input);

        if (testParams[2]) {
          const expected =
            testParams.length > 3 ? testParams[3] : testParams[1];
          test("does not return errors", () =>
            expect(parseResult.errors).toHaveLength(0));
          test("succeeds", () =>
            expect(parseResult).toHaveProperty("success", true));
          test(`parses to ${stringify(expected)}`, () => {
            if (parseResult.success) {
              expect(parseResult.value).toStrictEqual(expected);
            }
          });
          return;
        }

        test("fails", () =>
          expect(parseResult).toHaveProperty("success", false));

        const expectedErrorCodes = testParams[3]
          ? Array.isArray(testParams[3])
            ? testParams[3]
            : [testParams[3]]
          : [];
        const expectedErrorMessages = testParams[4]
          ? Array.isArray(testParams[4])
            ? testParams[4]
            : [testParams[4]]
          : [];
        const expectedErrorPaths = testParams[5]
          ? isPath(testParams[5])
            ? [testParams[5]]
            : testParams[5]
          : [];

        if (expectedErrorCodes.length > 0) {
          test("returns correct error code(s)", () => {
            if (parseResult.success) {
              return;
            }
            expect(parseResult.errors.map((e) => e.code)).toStrictEqual(
              expectedErrorCodes
            );
          });
        }

        if (expectedErrorMessages.length > 0) {
          test("returns correct error message(s)", () => {
            if (parseResult.success) {
              return;
            }
            expect(parseResult.errors.map((e) => e.message)).toStrictEqual(
              expectedErrorMessages
            );
          });
        }

        if (expectedErrorPaths.length > 0) {
          test("returns correct error path(s)", () => {
            if (parseResult.success) {
              return;
            }
            expect(parseResult.errors.map((e) => e.path)).toStrictEqual(
              expectedErrorPaths
            );
          });
        }

        test("supports detached parse()", () => {
          const { parse } = parser;
          const detachedResult = parse.call(undefined, input);
          expect(detachedResult).toStrictEqual(parseResult);
        });
      });
    });
  });
}

function stringify(value: any): string {
  return JSON.stringify(value, (key, value) => {
    if (value === undefined) {
      return "<<undefined>>";
    }
    if (value === null) {
      return "<<null>>";
    }
    if (value === Infinity) {
      return "<<Infinity>>";
    }
    if (value === -Infinity) {
      return "<<-Infinity>>";
    }
    if (typeof value === "number" && isNaN(value)) {
      return "<<NaN>>";
    }
    return value;
  }).replace(/"<<(.+)>>"/g, "$1");
}

function isPath(input: unknown): input is Path {
  return (
    Array.isArray(input) &&
    input.every((item) => typeof item === "string" || typeof item === "number")
  );
}
