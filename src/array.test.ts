import { V } from ".";
import { runNormalizationTests, runValidationTests } from "./test-utils";
import { Path } from "./types";

describe("isArray()", () => {
  const tests: [any, boolean, string?, string?][] = [
    [undefined, false, "invalidType", "input must be an array"],
    [null, false, "invalidType", "input must be an array"],
    [{}, false, "invalidType", "input must be an array"],
    [{ length: 1, "1": "foo" }, false, "invalidType", "input must be an array"],
    [[], true],
    [["foo", true, 1234, null, undefined], true],
  ];

  runValidationTests(V.isArray(), tests);

  describe("allItemsPass", () => {
    describe("errorCode specified", () => {
      const validator = V.isArray()
        .of(V.isNumber())
        .allItemsPass(
          (value) => value > 0,
          "must_be_positive",
          "must be positive"
        );

      const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
        [undefined, false, ["invalidType"], ["input must be an array"]],
        [[], true],
        [[1, 2, -3], false, ["must_be_positive"], ["must be positive"], [[2]]],
        [[1, 2, 3], true],
      ];

      runValidationTests(validator, tests);
    });
    describe("errorCode not specified", () => {
      const validator = V.isArray()
        .of(V.isNumber())
        .allItemsPass((value) => value > 0);

      const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
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

      runValidationTests(validator, tests);
    });

    describe("with validator", () => {
      const validator = V.isArray()
        .of(V.isString())
        .allItemsPass(V.isString().minLength(2));
      const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
        [undefined, false, ["invalidType"], [""], [[]]],
        [["foo", "bar", "a"], false, ["minLength"], [""], [[2]]],
      ];
    });
  });

  describe("defaultedTo()", () => {
    const validator = V.isArray().defaultedTo(["foo"]);
    const tests: [any, any, boolean][] = [
      [undefined, ["foo"], true],
      [null, ["foo"], true],
      [false, false, false],
      [[], [], true],
    ];
    runNormalizationTests(validator, tests);
  });

  describe("maxLength", () => {
    const validator = V.isArray().maxLength(2);
    const tests: [any, boolean, string?, string?][] = [
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
    runValidationTests(validator, tests);
  });

  describe("minLength", () => {
    const validator = V.isArray().minLength(2);

    const tests: [any, boolean, string?, string?][] = [
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

    runValidationTests(validator, tests);
  });

  describe("normalizedWith", () => {
    const validator = V.isArray()
      .of(V.isString())
      .normalizedWith((values: string[]) =>
        values.map((value) => value.toUpperCase())
      );

    const tests: [any, any, boolean][] = [
      [["foo", "Bar"], ["FOO", "BAR"], true],
    ];

    runNormalizationTests(validator, tests);
  });

  describe("of()", () => {
    const validator = V.isArray().of(V.isString());
    const tests: [any, boolean, string?, string?, Path?][] = [
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

    runValidationTests(validator, tests);
  });

  describe("passes", () => {
    function allPositive(input: number[]): boolean {
      return input.every((item) => item > 0);
    }

    const validator = V.isArray()
      .of(V.isNumber())
      .passes(allPositive, "not_positive", "should be positive");

    const tests: [any, boolean, string?, string?, Path?][] = [
      [[], true],
      [null, false, "invalidType", "input must be an array", []],
      [undefined, false, "invalidType", "input must be an array", []],
      ["", false, "invalidType", "input must be an array", []],
      [[1, 2, -1], false, "not_positive", "should be positive", []],
      [[1, 2, 3], true],
    ];

    runValidationTests(validator, tests);
  });
});
