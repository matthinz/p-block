import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isArray()", () => {
  const tests: ParsingTest<unknown[]>[] = [
    [undefined, false, "invalidType", "input must be an array"],
    [null, false, "invalidType", "input must be an array"],
    [{}, false, "invalidType", "input must be an array"],
    [{ length: 1, "1": "foo" }, false, "invalidType", "input must be an array"],
    [[], true],
    [["foo", true, 1234, null, undefined], true],
  ];

  runParsingTests(V.isArray(), tests);

  describe("allItemsPass", () => {
    describe("errorCode specified", () => {
      const validator = V.isArray()
        .of(V.isNumber())
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

      runParsingTests(validator, tests);
    });
    describe("errorCode not specified", () => {
      const validator = V.isArray()
        .of(V.isNumber())
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

      runParsingTests(validator, tests);
    });
  });

  describe("defaultedTo()", () => {
    const validator = V.isArray().defaultedTo(["foo"]);
    const tests: ParsingTest<string[]>[] = [
      [undefined, true, ["foo"]],
      [null, true, ["foo"]],
      [false, false, "invalidType"],
      [[], true],
    ];
    runParsingTests(validator, tests);

    describe("combined with item normalization", () => {
      const validator = V.isArray()
        .defaultedTo(["foo", undefined, null, "bar"])
        .of(V.isString().defaultedTo(""));
      const tests: ParsingTest<string[]>[] = [
        [undefined, true, ["foo", "", "", "bar"]],
        [null, true, ["foo", "", "", "bar"]],
        [[undefined, null], true, ["", ""]],
        [["foo", undefined, null, "bar"], true, ["foo", "", "", "bar"]],
      ];
      runParsingTests(validator, tests);
    });
  });

  describe("filtered", () => {
    const validator = V.isArray()
      .of(V.isString())
      .filtered((s) => s.length > 3);

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [["foo", "bar"], true, []],
      [["foo", "bar", "bazz"], true, ["bazz"]],
    ];

    runParsingTests(validator, tests);
  });

  describe("mapped", () => {
    const validator = V.isArray()
      .of(V.isString())
      .mapped((s) => s.toUpperCase());

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [[], true, []],
      [["foo", "bar"], true, ["FOO", "BAR"]],
    ];

    runParsingTests(validator, tests);
  });

  describe("maxLength", () => {
    const validator = V.isArray().maxLength(2);
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
    runParsingTests(validator, tests);
  });

  describe("minLength", () => {
    const validator = V.isArray().minLength(2);

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

    runParsingTests(validator, tests);
  });

  describe("normalizedWith", () => {
    const validator = V.isArray()
      .of(V.isString())
      .normalizedWith((values: string[]) =>
        values.map((value) => value.toUpperCase())
      );

    const tests: ParsingTest<string[]>[] = [
      [undefined, false, "invalidType"],
      [["foo", "Bar"], true, ["FOO", "BAR"]],
      [["FOO", "BAR"], true, ["FOO", "BAR"]],
    ];

    runParsingTests(validator, tests);
  });

  describe("of()", () => {
    const validator = V.isArray().of(V.isString());
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

    runParsingTests(validator, tests);
  });

  describe("passes", () => {
    function allPositive(input: number[]): boolean {
      return input.every((item) => item > 0);
    }

    const validator = V.isArray()
      .of(V.isNumber())
      .passes(allPositive, "not_positive", "should be positive");

    const tests: ParsingTest<number[]>[] = [
      [[], true],
      [null, false, "invalidType", "input must be an array", []],
      [undefined, false, "invalidType", "input must be an array", []],
      ["", false, "invalidType", "input must be an array", []],
      [[1, 2, -1], false, "not_positive", "should be positive", []],
      [[1, 2, 3], true],
    ];

    runParsingTests(validator, tests);
  });
});
