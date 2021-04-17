import { V } from "./validator";

describe("V.isString()", () => {
  describe("validate()", () => {
    const tests: [any, boolean][] = [
      [undefined, false],
      [null, false],
      [true, false],
      [false, false],
      ["foo", true],
    ];

    tests.forEach(([input, shouldValidate]) => {
      const desc = input === undefined ? "undefined" : JSON.stringify(input);
      test(`${desc} ${
        shouldValidate ? "validates" : "does not validate"
      }`, () => {
        const actual = V.isString().validate(input);
        expect(actual).toBe(shouldValidate);
      });
    });
  });

  describe("matches", () => {
    const tests: [RegExp, string, boolean, string?, string?][] = [
      [/foo/, "foo", true],
      [
        /foo/,
        "bar",
        false,
        "matches",
        "input must match regular expression /foo/",
      ],
    ];
    tests.forEach(([regex, input, shouldValidate, errorCode, errorMessage]) => {
      test(`"${input}" ${
        shouldValidate ? "validates" : "does not validate"
      } against ${regex}`, () => {
        const v = V.isString().matches(regex);
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });

    describe("throwing", () => {
      tests.forEach(
        ([regex, input, shouldValidate, errorCode, errorMessage]) => {
          test(`"${input}" ${
            shouldValidate ? "validates" : "does not validate"
          } against ${regex}`, () => {
            const v = V.isString().matches(regex).shouldThrow();
            try {
              v.validate(input);
              expect(shouldValidate).toBe(true);
            } catch (err) {
              expect(shouldValidate).toBe(false);
              expect(err).toHaveProperty("code", errorCode);
              expect(err).toHaveProperty("message", errorMessage);
              expect(err).toHaveProperty("path", []);
            }
          });
        }
      );
    });
  });

  describe("maxLength", () => {
    test.todo("must be at least 0");

    const tests: [number, string, boolean, string?, string?][] = [
      [12, "blah", true],
      [
        3,
        "blah",
        false,
        "maxLength",
        "input length must be less than or equal to 3 character(s)",
      ],
    ];

    tests.forEach(([max, input, shouldValidate]) => {
      test(`"${input}" (max: ${max}) ${
        shouldValidate ? "validates" : "does not validate"
      }`, () => {
        const v = V.isString().maxLength(max);
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });

    describe("throwing", () => {
      tests.forEach(([max, input, shouldValidate, errorCode, errorMessage]) => {
        test(`"${input}" (max: ${max}) ${
          shouldValidate ? "does not throw" : "throws"
        }`, () => {
          const v = V.isString().maxLength(max).shouldThrow();
          try {
            v.validate(input);
            expect(shouldValidate).toBe(true);
          } catch (err) {
            expect(shouldValidate).toBe(false);
            expect(err).toHaveProperty("code", errorCode);
            expect(err).toHaveProperty("message", errorMessage);
            expect(err).toHaveProperty("path", []);
          }
        });
      });
    });
  });

  describe("minLength", () => {
    test.todo("must be at least 0");

    const tests: [number, string, boolean, string?, string?][] = [
      [
        12,
        "blah",
        false,
        "minLength",
        "input length must be greater than or equal to 12 character(s)",
      ],
      [3, "blah", true],
    ];

    tests.forEach(([max, input, shouldValidate]) => {
      test(`"${input}" (max: ${max}) ${
        shouldValidate ? "validates" : "does not validate"
      }`, () => {
        const v = V.isString().minLength(max);
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });

    describe("throwing", () => {
      tests.forEach(([max, input, shouldValidate, errorCode, errorMessage]) => {
        test(`"${input}" (max: ${max}) ${
          shouldValidate ? "does not throw" : "throws"
        }`, () => {
          const v = V.isString().minLength(max).shouldThrow();
          try {
            v.validate(input);
            expect(shouldValidate).toBe(true);
          } catch (err) {
            expect(shouldValidate).toBe(false);
            expect(err).toHaveProperty("code", errorCode);
            expect(err).toHaveProperty("message", errorMessage);
            expect(err).toHaveProperty("path", []);
          }
        });
      });
    });
  });

  describe("notEmpty()", () => {
    const tests: [any, boolean, string?, string?][] = [
      [null, false, "isString", "input must be a string"],
      ["", false, "notEmpty", "input cannot be an empty string"],
      [" ", true],
    ];
    tests.forEach(([input, shouldValidate, errorCode, errorMessage]) => {
      test(`"${input}" ${
        shouldValidate ? "validates" : "does not validate"
      }`, () => {
        const v = V.isString().notEmpty();
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });

    describe("throwing", () => {
      tests.forEach(([input, shouldValidate, errorCode, errorMessage]) => {
        test(`${input} ${
          shouldValidate ? "validates" : "does not validate"
        }`, () => {
          const v = V.isString().notEmpty().shouldThrow();
          try {
            v.validate(input);
            expect(shouldValidate).toBe(true);
          } catch (err) {
            expect(shouldValidate).toBe(false);
            expect(err).toHaveProperty("code", errorCode);
            expect(err).toHaveProperty("message", errorMessage);
            expect(err).toHaveProperty("path", []);
          }
        });
      });
    });
  });

  describe("passes()", () => {
    const tests: [string, string, boolean, string?, string?][] = [
      ["valid input", "foo", true],
      ["invalid input", "bar", false, "not_foo", "input must be 'foo'"],
    ];

    const v = V.isString().passes(
      (s) => s === "foo",
      "not_foo",
      "input must be 'foo'"
    );

    tests.forEach(([desc, input, shouldValidate, errorCode, errorMessage]) => {
      test(desc, () => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });

    describe("throwing", () => {
      const throwingV = v.shouldThrow();

      tests.forEach(
        ([desc, input, shouldValidate, errorCode, errorMessage]) => {
          test(desc, () => {
            try {
              throwingV.validate(input);
              expect(shouldValidate).toBe(true);
            } catch (err) {
              expect(shouldValidate).toBe(false);
              expect(err).toHaveProperty("message", errorMessage);
              expect(err).toHaveProperty("code", errorCode);
              expect(err).toHaveProperty("path", []);
            }
          });
        }
      );
    });
  });

  describe("trimmed()", () => {
    const tests: [string, string, boolean][] = [["  foo ", "foo", true]];
    const v = V.isString().trimmed().maxLength(3);

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });

  describe("lowerCased()", () => {
    const tests: [string, string, boolean][] = [["FOO", "foo", true]];
    const v = V.isString().lowerCased();

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });

  describe("upperCased()", () => {
    const tests: [string, string, boolean][] = [["foo", "FOO", true]];
    const v = V.isString().upperCased();

    describe("normalize()", () => {
      tests.forEach(([input, expected]) => {
        test(`"${input}" -> "${expected}"`, () => {
          const actual = v.normalize(input);
          expect(actual).toBe(expected);
        });
      });
    });

    describe("validate()", () => {
      tests.forEach(([input, expected, shouldValidate]) => {
        expect(v.validate(input)).toBe(shouldValidate);
      });
    });
  });

  describe("throw()", () => {
    test("can be enabled", () => {
      const v = V.isString().shouldThrow();
      expect(() => {
        v.validate(1234);
      }).toThrowError();
    });
  });
});
