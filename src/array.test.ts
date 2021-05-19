import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("array()", () => {
  const tests: ParsingTest<unknown[]>[] = [
    [undefined, false, "invalidType", "input must be an array"],
    [null, false, "invalidType", "input must be an array"],
    [{}, false, "invalidType", "input must be an array"],
    [{ length: 1, "1": "foo" }, false, "invalidType", "input must be an array"],
    [[], true],
    [["foo", true, 1234, null, undefined], true],
  ];

  runParsingTests(P.array(), tests);

  describe("allItemsPass", () => {
    describe("errorCode specified", () => {
      const parser = P.array()
        .of(P.number())
        .allItemsPass(
          (value) => value > 0,
          "must_be_positive",
          "must be positive"
        );

      const tests: ParsingTest<number[]>[] = [
        [undefined, false, ["invalidType"], ["input must be an array"]],
        [[], true],
        [[1, 2, -3], false, ["must_be_positive"], ["must be positive"], [[2]]],
        [[1, 2, 3], true],
      ];

      runParsingTests(parser, tests);
    });
    describe("errorCode not specified", () => {
      const parser = P.array()
        .of(P.number())
        .allItemsPass((value) => value > 0);

      const tests: ParsingTest<number[]>[] = [
        [undefined, false, ["invalidType"], ["input must be an array"]],
        [[], true],
        [
          [1, 2, -3],
          false,
          ["allItemsPass"],
          ["all items in input array must pass the check"],
          [[2]],
        ],
        [[1, 2, 3], true],
      ];

      runParsingTests(parser, tests);
    });
  });

  describe("defaultedTo()", () => {
    const parser = P.array().defaultedTo(["foo"]);
    const tests: ParsingTest<string[]>[] = [
      [undefined, true, ["foo"]],
      [null, true, ["foo"]],
      [false, false, "invalidType"],
      [[], true],
    ];
    runParsingTests(parser, tests);

    describe("combined with item normalization", () => {
      const parser = P.array()
        .defaultedTo(["foo", undefined, null, "bar"])
        .of(P.string().defaultedTo(""));
      const tests: ParsingTest<string[]>[] = [
        [undefined, true, ["foo", "", "", "bar"]],
        [null, true, ["foo", "", "", "bar"]],
        [[undefined, null], true, ["", ""]],
        [["foo", undefined, null, "bar"], true, ["foo", "", "", "bar"]],
      ];
      runParsingTests(parser, tests);
    });
  });

  describe("filtered", () => {
    const parser = P.array()
      .of(P.string())
      .filtered((s) => s.length > 3);

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [["foo", "bar"], true, []],
      [["foo", "bar", "bazz"], true, ["bazz"]],
    ];

    runParsingTests(parser, tests);
  });

  describe("mapped", () => {
    const parser = P.array()
      .of(P.string())
      .mapped((s) => s.toUpperCase());

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [[], true, []],
      [["foo", "bar"], true, ["FOO", "BAR"]],
    ];

    runParsingTests(parser, tests);
  });

  describe("maxLength", () => {
    const parser = P.array().maxLength(2);
    const tests: ParsingTest<unknown[]>[] = [
      [undefined, false, "invalidType", "input must be an array"],
      [[], true],
      [["foo"], true],
      [["foo", "bar"], true],
      [
        ["foo", "bar", "baz"],
        false,
        "maxLength",
        "input must be an array of no more than 2 item(s)",
      ],
    ];
    runParsingTests(parser, tests);
  });

  describe("minLength", () => {
    const parser = P.array().minLength(2);

    const tests: ParsingTest<unknown[]>[] = [
      [undefined, false, "invalidType", "input must be an array"],
      [[], false, "minLength", "input must be an array of at least 2 item(s)"],
      [
        ["foo"],
        false,
        "minLength",
        "input must be an array of at least 2 item(s)",
      ],
      [["foo", "bar"], true],
      [["foo", "bar", "baz"], true],
    ];

    runParsingTests(parser, tests);
  });

  describe("normalizedWith", () => {
    const parser = P.array()
      .of(P.string())
      .normalizedWith((values: string[]) =>
        values.map((value) => value.toUpperCase())
      );

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [["foo", "Bar"], true, ["FOO", "BAR"]],
      [["FOO", "BAR"], true, ["FOO", "BAR"]],
    ];

    runParsingTests(parser, tests);
  });

  describe("of()", () => {
    const parser = P.array().of(P.string());
    const tests: ParsingTest<string[]>[] = [
      [[], true],
      [[123], false, "invalidType", "input must be of type 'string'", [0]],
      [
        ["foo", 123],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", null],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", undefined],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", new Date()],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [
        ["foo", {}],
        false,
        "invalidType",
        "input must be of type 'string'",
        [1],
      ],
      [["foo", "bar"], true],
    ];

    runParsingTests(parser, tests);
  });

  describe("of() [implicit]", () => {
    const parser = P.array(P.string());
    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [[], true],
      [[1234], false, "invalidType", "input must be of type 'string'", [0]],
    ];
    runParsingTests(parser, tests);
  });

  describe("passes", () => {
    function allPositive(input: number[]): boolean {
      return input.every((item) => item > 0);
    }

    const parser = P.array()
      .of(P.number())
      .passes(allPositive, "not_positive", "should be positive");

    const tests: ParsingTest<number[]>[] = [
      [[], true],
      [null, false, "invalidType", "input must be an array", []],
      [undefined, false, "invalidType", "input must be an array", []],
      ["", false, "invalidType", "input must be an array", []],
      [[1, 2, -1], false, "not_positive", "should be positive", []],
      [[1, 2, 3], true],
    ];

    runParsingTests(parser, tests);
  });
});
