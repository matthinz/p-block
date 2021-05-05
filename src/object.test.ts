import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isObject()", () => {
  describe("withProperties", () => {
    const validator = V.isObject().withProperties({
      firstName: V.isString(),
      lastName: V.isString(),
    });

    const tests: ParsingTest<{
      firstName: string;
      lastName: string;
    }>[] = [
      [undefined, false, "invalidType", "input must be an object", []],
      [null, false, "invalidType", "input must be an object", []],
      [[], false, "invalidType", "input must be an object", []],
      [
        {
          firstName: 123,
          lastName: "bar",
        },
        false,
        "invalidType",
        "input must be of type 'string'",
        ["firstName"],
      ],
      [
        {
          firstName: "foo",
        },
        false,
        "required",
        "input must include property 'lastName'",
        ["lastName"],
      ],
      [
        {},
        false,
        ["required", "required"],
        [
          "input must include property 'firstName'",
          "input must include property 'lastName'",
        ],
        [["firstName"], ["lastName"]],
      ],

      [{ firstName: "foo", lastName: "bar" }, true],
      [
        {
          firstName: "foo",
          lastName: "bar",
          extraProperty: "should be allowed",
        },
        true,
      ],
    ];

    runParsingTests(validator, tests);
  });

  describe("withProperties (2 levels deep)", () => {
    const validator = V.isObject().withProperties({
      name: V.isString(),
      address: V.isObject().withProperties({
        street: V.isString(),
        city: V.isString(),
        state: V.isString().maxLength(2),
        zip: V.isString().maxLength(5).matches(/\d{5}/),
      }),
    });

    type TestType = {
      name: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
    };

    const tests: ParsingTest<TestType>[] = [
      [
        {},
        false,
        ["required", "required"],
        [
          "input must include property 'name'",
          "input must include property 'address'",
        ],
        [["name"], ["address"]],
      ],
      [
        {
          name: "Test",
          address: {},
        },
        false,
        ["required", "required", "required", "required"],
        [
          "input must include property 'street'",
          "input must include property 'city'",
          "input must include property 'state'",
          "input must include property 'zip'",
        ],
        [
          ["address", "street"],
          ["address", "city"],
          ["address", "state"],
          ["address", "zip"],
        ],
      ],
    ];

    runParsingTests(validator, tests);
  });

  describe("propertyPasses()", () => {
    describe("no errorCode", () => {
      const validator = V.isObject()
        .withProperties({
          email: V.isString(),
          confirmEmail: V.isString(),
        })
        .propertyPasses(
          "confirmEmail",
          (confirmEmail, { email }) => confirmEmail === email
        );

      const tests: ParsingTest<{ email: string; confirmEmail: string }>[] = [
        [undefined, false, "invalidType"],
        [{ email: "foo@example.org" }, false, "required"],
        [
          { email: "foo@example.org", confirmEmail: "" },
          false,
          "propertyPasses",
          "input must include a valid value for the property 'confirmEmail'",
          ["confirmEmail"],
        ],
        [{ email: "foo@example.org", confirmEmail: "foo@example.org" }, true],
      ];

      runParsingTests(validator, tests);
    });
  });

  describe("defaultedTo()", () => {
    const validator = V.isObject()
      .withProperties({
        name: V.isString(),
        age: V.isNumber(),
      })
      .defaultedTo({
        name: "Chris Exampleton",
      });

    type TestType = {
      name: string;
      age: number;
    };

    const tests: ParsingTest<TestType>[] = [
      [undefined, false, "required", "input must include property 'age'"],
      [null, false, "required", "input must include property 'age'"],
      [123, false, "invalidType"],
      [{}, false, "required", "input must include property 'age'"],
      [{ name: "Pat Exampleton", age: 99 }, true],
      [{ age: 99 }, true, { name: "Chris Exampleton", age: 99 }],
    ];

    runParsingTests(validator, tests);
  });
});
