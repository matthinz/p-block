import { V } from ".";
import {
  ParsingTest,
  ParsingTestWithParser,
  runParsingTests,
} from "./test-utils";

// cspell:ignore abcdefghi abcdefghij abcdefghijk falses

describe("V.isString()", () => {
  describe("stock", () => {
    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType", "input must be of type 'string'"],
      [null, false, "invalidType", "input must be of type 'string'"],
      [true, false, "invalidType", "input must be of type 'string'"],
      [false, false, "invalidType", "input must be of type 'string'"],
      ["foo", true],
    ];

    runParsingTests(V.isString(), tests);
  });

  describe("defaultedTo()", () => {
    const validator = V.isString().defaultedTo("");

    const tests: ParsingTest<string>[] = [
      [undefined, true, ""],
      [null, true, ""],
      ["foo", true, "foo"],
      [1234, false, "invalidType"],
    ];

    runParsingTests(validator, tests);
  });

  describe("matches", () => {
    const tests: ParsingTest<string>[] = [
      ["foo", true],
      ["bar", false, "matches", "input must match regular expression /foo/"],
    ];

    runParsingTests(V.isString().matches(/foo/), tests);
  });

  describe("maxLength", () => {
    test.todo("must be at least 0");

    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["blah", true],
      ["abcdefghij", true],
      [
        "abcdefghijk",
        false,
        "maxLength",
        "input length must be less than or equal to 10 character(s)",
      ],
    ];

    const validator = V.isString().maxLength(10);

    runParsingTests(validator, tests);
  });

  describe("minLength", () => {
    test.todo("must be at least 0");

    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [
        "",
        false,
        "minLength",
        "input length must be greater than or equal to 10 character(s)",
      ],
      [
        "abcdefghi",
        false,
        "minLength",
        "input length must be greater than or equal to 10 character(s)",
      ],
      ["abcdefghij", true],
      ["abcdefghijk", true],
    ];

    const validator = V.isString().minLength(10);

    runParsingTests(validator, tests);
  });

  describe("notEmpty()", () => {
    const tests: ParsingTest<string>[] = [
      [null, false, "invalidType", "input must be of type 'string'"],
      ["", false, "notEmpty", "input cannot be an empty string"],
      [" ", true],
    ];

    const validator = V.isString().notEmpty();

    runParsingTests(validator, tests);
  });

  describe("parsedAsBoolean()", () => {
    describe("default parser", () => {
      const trues = "y|Y|yes|Yes|YES|true|True|TRUE|on|On|ON".split("|");
      const falses = "n|N|no|No|NO|false|False|FALSE|off|Off|OFF".split("|");

      runParsingTests(
        V.isString().parsedAsBoolean().isTrue(),
        trues
          .map((input) => [input, true, true] as ParsingTest<boolean>)
          .concat(falses.map((input) => [input, false] as ParsingTest<boolean>))
      );

      runParsingTests(V.isString().parsedAsBoolean(), [
        ...trues.map((input) => [input, true, true] as ParsingTest<boolean>),
        ...falses.map((input) => [input, true, false] as ParsingTest<boolean>),
      ]);

      runParsingTests(
        V.isString().parsedAsBoolean().isFalse(),
        falses
          .map((input) => [input, true, false] as ParsingTest<boolean>)
          .concat(
            trues.map(
              (input) => [input, false, "isFalse"] as ParsingTest<boolean>
            )
          )
      );

      runParsingTests(V.isString().parsedAsBoolean(), [
        [undefined, false, "invalidType"],
        [null, false, "invalidType"],
        [
          "not a boolean",
          false,
          "parsedAsBoolean",
          "input could not be parsed as a boolean",
        ],
      ]);
    });

    describe("custom parser", () => {
      function parse(input: string): boolean | undefined {
        if (input === "heck yeah") {
          return true;
        } else if (input === "naw") {
          return false;
        }
      }

      const validator = V.isString().parsedAsBoolean(
        parse,
        "bad_bool",
        "was a bad bool"
      );

      const tests: ParsingTest<boolean>[] = [
        [undefined, false, "invalidType"],
        [new Date(), false, "invalidType"],
        ["heck yeah", true, true],
        ["naw", true, false],
        ["something else", false, "bad_bool", "was a bad bool"],
      ];

      runParsingTests(validator, tests);
    });
  });

  describe("parsedAsDate()", () => {
    describe("default parser", () => {
      const validator = V.isString().parsedAsDate();

      const tests: ParsingTest<Date>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        ["", false, "parsedAsDate", "input could not be parsed as a Date"],
        ["", false, "parsedAsDate", "input could not be parsed as a Date"],
        ["2021-04-21", true, new Date(2021, 3, 21)],
        [
          "2021-04-21T15:47:47+00:00",
          true,
          new Date(Date.UTC(2021, 3, 21, 15, 47, 47)),
        ],
        [
          "2021-04-21T15:47:47Z",
          true,
          new Date(Date.UTC(2021, 3, 21, 15, 47, 47)),
        ],
        ["20210421T154747Z", false],
      ];

      runParsingTests(validator, tests);
    });

    describe("custom parser", () => {
      function parseDate(input: any): Date | undefined {
        if (input === "when star wars came out") {
          return new Date(1977, 4, 25);
        }
      }

      const tests: ParsingTest<Date>[] = [
        [undefined, false, "invalidType"],
        [null, false, "invalidType"],
        ["", false, "parsedAsDate"],
        ["when star wars came out", true, new Date(1977, 4, 25)],
        ["some other date", false, "parsedAsDate"],
      ];

      runParsingTests(V.isString().parsedAsDate(parseDate), tests);
    });
  });

  describe("parsedAsFloat()", () => {
    describe("default parser", () => {
      const validator = V.isString().parsedAsFloat().greaterThan(10);
      const tests: ParsingTest<number>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        [1, false, "invalidType"],
        ["Infinity", false, "parsedAsFloat"],
        ["+Infinity", false, "parsedAsFloat"],
        ["-Infinity", false, "parsedAsFloat"],
        ["foo", false, "parsedAsFloat", "input could not be parsed as a float"],
        [
          "11.0.0.0",
          false,
          "parsedAsFloat",
          "input could not be parsed as a float",
        ],
        [
          "11.0.",
          false,
          "parsedAsFloat",
          "input could not be parsed as a float",
        ],
        ["1", false, "greaterThan"],
        ["11.0000001", true, 11.0000001],
        ["11", true, 11],
        ["11.0", true, 11],
        ["11.00000", true, 11],
      ];

      runParsingTests(validator, tests);
    });
    describe("custom parser", () => {
      const validator = V.isString().parsedAsFloat((input) =>
        input === "answer" ? 42.0 : undefined
      );
      const tests: ParsingTest<number>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        ["answer", true, 42],
        ["42", false, "parsedAsFloat"],
      ];
      runParsingTests(validator, tests);
    });
  });

  describe("parsedAsInteger()", () => {
    describe("built-in parser, base 10", () => {
      const validator = V.isString().parsedAsInteger().greaterThan(10);
      const tests: ParsingTest<number>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        [1, false, "invalidType"],
        ["Infinity", false, "parsedAsInteger"],
        ["+Infinity", false, "parsedAsInteger"],
        ["-Infinity", false, "parsedAsInteger"],
        [
          "foo",
          false,
          "parsedAsInteger",
          "input could not be parsed as an integer",
        ],
        [
          "11.0.0.0",
          false,
          "parsedAsInteger",
          "input could not be parsed as an integer",
        ],
        [
          "11.0.",
          false,
          "parsedAsInteger",
          "input could not be parsed as an integer",
        ],
        [
          "11.0000001",
          false,
          "parsedAsInteger",
          "input could not be parsed as an integer",
        ],
        ["1", false, "greaterThan"],
        ["11", true, 11],
        ["11.0", true, 11],
        ["11.00000", true, 11],
      ];
      runParsingTests(validator, tests);
    });

    describe("custom radix", () => {
      const validator = V.isString().parsedAsInteger(16).greaterThan(10);
      const tests: ParsingTest<number>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        [1, false, "invalidType"],
        [
          "foo",
          false,
          "parsedAsInteger",
          "input could not be parsed as an integer",
        ],
        ["1", false, "greaterThan"],
        ["A", false, "greaterThan"],
        ["B", true, 11],
      ];
      runParsingTests(validator, tests);

      test("throws for radix < 2", () => {
        expect(() => {
          V.isString().parsedAsInteger(1);
        }).toThrow();
      });

      test("throws for radix < 36", () => {
        expect(() => {
          V.isString().parsedAsInteger(37);
        }).toThrow();
      });
    });

    describe("custom parser", () => {
      const validator = V.isString()
        .parsedAsInteger((input) => (input ?? "").toString().length)
        .greaterThan(10);
      const tests: ParsingTest<number>[] = [
        [undefined, false, "invalidType"],
        [{}, false, "invalidType"],
        [1, false, "invalidType"],
        ["1", false, "greaterThan"],
        ["a long string of more than 10 chars", true, 35],
      ];
      runParsingTests(validator, tests);
    });
  });

  describe("passes()", () => {
    const tests: ParsingTest<string>[] = [
      ["valid input", true],
      [
        "invalid input",
        false,
        "not_valid_input",
        "input must be 'valid input'",
      ],
    ];

    const validator = V.isString().passes(
      (s) => s === "valid input",
      "not_valid_input",
      "input must be 'valid input'"
    );

    runParsingTests(validator, tests);

    describe("with validator", () => {
      const validator = V.isString().passes(V.isString().minLength(5));
      const tests: ParsingTest<string>[] = [
        [undefined, false, "invalidType"],
        ["", false, "minLength"],
      ];
      runParsingTests(validator, tests);

      describe("can't override errorCode via passes", () => {
        const validator = V.isString().passes(
          V.isString().minLength(5),
          "custom_code"
        );
        const tests: ParsingTest<string>[] = [
          [undefined, false, "invalidType"],
          ["", false, "minLength"],
        ];
        runParsingTests(validator, tests);
      });
    });
  });

  describe("trimmed()", () => {
    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType"],
      ["  foo ", true, "foo"],
      ["foo", true, "foo"],
    ];
    const normalizer = V.isString().trimmed();

    runParsingTests(normalizer, tests);
  });

  describe("lowerCased()", () => {
    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType"],
      ["FOO", true, "foo"],
    ];
    const validator = V.isString().lowerCased();

    runParsingTests(validator, tests);
  });

  describe("upperCased()", () => {
    const tests: ParsingTest<string>[] = [
      [undefined, false, "invalidType"],
      ["foo", true, "FOO"],
    ];
    const validator = V.isString().upperCased();
    runParsingTests(validator, tests);
  });
});
