import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

const TEST_DATE = new Date(2021, 1, 2, 3, 4, 5, 6);
const EARLIER_DATE = new Date(2021, 1, 2, 3, 4, 5, 5);
const LATER_DATE = new Date(2021, 1, 2, 3, 4, 5, 7);

describe("date()", () => {
  describe("stock", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType", "input must be a Date"],
      [null, false, "invalidType", "input must be a Date"],
      [false, false, "invalidType", "input must be a Date"],
      [{}, false, "invalidType", "input must be a Date"],
      [
        {
          getDate: () => 1234,
        },
        false,
        "invalidType",
        "input must be a Date",
      ],
      [123456, false, "invalidType", "input must be a Date"],
      ["not a date", false, "invalidType", "input must be a Date"],
      [
        "2021-04-21T15:59:25.237Z",
        false,
        "invalidType",
        "input must be a Date",
      ],
      [
        new Date("not actually a date"),
        false,
        "invalidDate",
        "input must represent a valid Date",
      ],
      [new Date(2021, 3, 21), true],
    ];

    const parser = P.date();

    runParsingTests(parser, tests);
  });

  describe("defaultedTo()", () => {
    const date = new Date();
    const parser = P.date().defaultedTo(date);
    const tests: ParsingTest<Date>[] = [
      [undefined, true, date],
      [null, true, date],
      [false, false, "invalidType"],
      [new Date(2021, 3, 4), true, new Date(2021, 3, 4)],
    ];
    runParsingTests(parser, tests);
  });

  describe("equalTo()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [new Date(2021, 1, 2, 3, 4, 5, 6), true],
      [
        new Date(2021, 1, 2, 3, 4, 5, 7),
        false,
        "equalTo",
        `input must be equal to ${TEST_DATE.toISOString()}`,
      ],
    ];
    describe("literal Date", () => {
      const parser = P.date().equalTo(new Date(2021, 1, 2, 3, 4, 5, 6));
      runParsingTests(parser, tests);
    });
    describe("function", () => {
      const parser = P.date().equalTo(() => TEST_DATE);
      runParsingTests(parser, tests);
    });
  });

  describe("greaterThan()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [
        new Date(2021, 1, 2, 3, 4, 5, 6),
        false,
        "greaterThan",
        `input must be greater than ${TEST_DATE.toISOString()}`,
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 7), true],
    ];

    describe("literal Date", () => {
      const parser = P.date().greaterThan(TEST_DATE);
      runParsingTests(parser, tests);
    });

    describe("function", () => {
      const parser = P.date().greaterThan(() => TEST_DATE);
      runParsingTests(parser, tests);
    });
  });

  describe("greaterThanOrEqualTo()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [
        new Date(2021, 1, 2, 3, 4, 5, 5),
        false,
        "greaterThanOrEqualTo",
        `input must be greater than or equal to ${TEST_DATE.toISOString()}`,
      ],
      [TEST_DATE, true],
      [new Date(2021, 1, 2, 3, 4, 5, 7), true],
    ];

    describe("literal Date", () => {
      const parser = P.date().greaterThanOrEqualTo(TEST_DATE);
      runParsingTests(parser, tests);
    });

    describe("function", () => {
      const parser = P.date().greaterThanOrEqualTo(() => TEST_DATE);

      runParsingTests(parser, tests);
    });
  });

  describe("lessThan()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [
        new Date(2021, 1, 2, 3, 4, 5, 7),
        false,
        "lessThan",
        `input must be less than ${TEST_DATE.toISOString()}`,
      ],
      [
        TEST_DATE,
        false,
        "lessThan",
        `input must be less than ${TEST_DATE.toISOString()}`,
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 5), true],
    ];

    describe("literal Date", () => {
      const parser = P.date().lessThan(TEST_DATE);
      runParsingTests(parser, tests);
    });

    describe("function", () => {
      const parser = P.date().lessThan(() => TEST_DATE);

      runParsingTests(parser, tests);
    });
  });

  describe("lessThanOrEqualTo()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [
        LATER_DATE,
        false,
        "lessThanOrEqualTo",
        `input must be less than or equal to ${TEST_DATE.toISOString()}`,
      ],
      [TEST_DATE, true],
      [EARLIER_DATE, true],
    ];

    describe("literal Date", () => {
      const parser = P.date().lessThanOrEqualTo(TEST_DATE);
      runParsingTests(parser, tests);
    });

    describe("function", () => {
      const parser = P.date().lessThanOrEqualTo(() => TEST_DATE);

      runParsingTests(parser, tests);
    });
  });

  describe("normalizedWith()", () => {
    function removeTime(date: Date): Date {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const parser = P.date().normalizedWith(removeTime);

    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["", false, "invalidType"],
      [new Date(2021, 1, 2, 3, 4, 5, 6), true, new Date(2021, 1, 2)],
    ];

    runParsingTests(parser, tests);
  });
});
