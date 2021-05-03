import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isDate()", () => {
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

    const validator = V.isDate();

    runParsingTests(validator, tests);
  });

  describe("defaultedTo()", () => {
    const date = new Date();
    const validator = V.isDate().defaultedTo(date);
    const tests: ParsingTest<Date>[] = [
      [undefined, true, date],
      [null, true, date],
      [false, false, "invalidType"],
      [new Date(2021, 3, 4), true, new Date(2021, 3, 4)],
    ];
    runParsingTests(validator, tests);
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
        "input must be equal to 2021-02-02T11:04:05.006Z",
      ],
    ];
    describe("literal Date", () => {
      const validator = V.isDate().equalTo(new Date(2021, 1, 2, 3, 4, 5, 6));
      runParsingTests(validator, tests);
    });
    describe("function", () => {
      const validator = V.isDate().equalTo(() => {
        return new Date(2021, 1, 2, 3, 4, 5, 6);
      });
      runParsingTests(validator, tests);
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
        "input must be greater than 2021-02-02T11:04:05.006Z",
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 7), true],
    ];

    describe("literal Date", () => {
      const validator = V.isDate().greaterThan(
        new Date(2021, 1, 2, 3, 4, 5, 6)
      );
      runParsingTests(validator, tests);
    });

    describe("function", () => {
      const validator = V.isDate().greaterThan(() => {
        return new Date(2021, 1, 2, 3, 4, 5, 6);
      });
      runParsingTests(validator, tests);
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
        "input must be greater than or equal to 2021-02-02T11:04:05.006Z",
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 6), true],
      [new Date(2021, 1, 2, 3, 4, 5, 7), true],
    ];

    describe("literal Date", () => {
      const validator = V.isDate().greaterThanOrEqualTo(
        new Date(2021, 1, 2, 3, 4, 5, 6)
      );
      runParsingTests(validator, tests);
    });

    describe("function", () => {
      const validator = V.isDate().greaterThanOrEqualTo(
        () => new Date(2021, 1, 2, 3, 4, 5, 6)
      );

      runParsingTests(validator, tests);
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
        "input must be less than 2021-02-02T11:04:05.006Z",
      ],
      [
        new Date(2021, 1, 2, 3, 4, 5, 6),
        false,
        "lessThan",
        "input must be less than 2021-02-02T11:04:05.006Z",
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 5), true],
    ];

    describe("literal Date", () => {
      const validator = V.isDate().lessThan(new Date(2021, 1, 2, 3, 4, 5, 6));
      runParsingTests(validator, tests);
    });

    describe("function", () => {
      const validator = V.isDate().lessThan(
        () => new Date(2021, 1, 2, 3, 4, 5, 6)
      );

      runParsingTests(validator, tests);
    });
  });

  describe("lessThanOrEqualTo()", () => {
    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      [{}, false, "invalidType"],
      [
        new Date(2021, 1, 2, 3, 4, 5, 7),
        false,
        "lessThanOrEqualTo",
        "input must be less than or equal to 2021-02-02T11:04:05.006Z",
      ],
      [new Date(2021, 1, 2, 3, 4, 5, 6), true],
      [new Date(2021, 1, 2, 3, 4, 5, 5), true],
    ];

    describe("literal Date", () => {
      const validator = V.isDate().lessThanOrEqualTo(
        new Date(2021, 1, 2, 3, 4, 5, 6)
      );
      runParsingTests(validator, tests);
    });

    describe("function", () => {
      const validator = V.isDate().lessThanOrEqualTo(
        () => new Date(2021, 1, 2, 3, 4, 5, 6)
      );

      runParsingTests(validator, tests);
    });
  });

  describe("normalizedWith()", () => {
    function removeTime(date: Date): Date {
      // XXX: normalizedWith() should probably only take strongly-typed normalization functions
      if (!(date instanceof Date)) {
        return date;
      }

      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const validator = V.isDate().normalizedWith(removeTime);

    const tests: ParsingTest<Date>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["", false, "invalidType"],
      [new Date(2021, 1, 2, 3, 4, 5, 6), true, new Date(2021, 1, 2)],
    ];

    runParsingTests(validator, tests);
  });
});
