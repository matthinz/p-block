import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

class NotAPlainObject {}

describe("object()", () => {
  it("allows passing properties", () => {
    const parser = P.object({
      firstName: P.string(),
      lastName: P.string(),
    });

    const result = parser.parse({
      firstName: 8,
      lastName: "bar",
    });

    expect(result).toHaveProperty("success", false);
  });

  describe("withProperties", () => {
    const parser = P.object().withProperties({
      firstName: P.string(),
      lastName: P.string(),
    });

    const tests: ParsingTest<{
      firstName: string;
      lastName: string;
    }>[] = [
      [undefined, false, "invalidType", "input must be an object", []],
      [null, false, "invalidType", "input must be an object", []],
      [[], false, "invalidType", "input must be an object", []],
      [
        new NotAPlainObject(),
        false,
        ["required", "required"],
        [
          "input must include property 'firstName'",
          "input must include property 'lastName'",
        ],
        [["firstName"], ["lastName"]],
      ],
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

    runParsingTests(parser, tests);
  });

  describe("withProperties (2 levels deep)", () => {
    const parser = P.object().withProperties({
      name: P.string(),
      address: P.object().withProperties({
        street: P.string(),
        city: P.string(),
        state: P.string().maxLength(2),
        zip: P.string().maxLength(5).matches(/\d{5}/),
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

    runParsingTests(parser, tests);
  });

  describe("propertiesMatch()", () => {
    describe("no errorCode", () => {
      const parser = P.object()
        .withProperties({
          email: P.string(),
          confirmEmail: P.string(),
        })
        .propertiesMatch("confirmEmail", "email");

      const tests: ParsingTest<{ email: string; confirmEmail: string }>[] = [
        [undefined, false, "invalidType"],
        [{ email: "foo@example.org" }, false, "required"],
        [
          { email: "foo@example.org", confirmEmail: "" },
          false,
          "propertiesMatch",
          "input must include a value for property 'confirmEmail' that matches the value for property 'email'",
          ["confirmEmail"],
        ],
        [{ email: "foo@example.org", confirmEmail: "foo@example.org" }, true],
      ];

      runParsingTests(parser, tests);
    });
  });

  describe("propertyPasses()", () => {
    describe("no errorCode", () => {
      const parser = P.object()
        .withProperties({
          email: P.string(),
          confirmEmail: P.string(),
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

      runParsingTests(parser, tests);
    });
  });

  describe("defaultedTo()", () => {
    const parser = P.object()
      .withProperties({
        name: P.string(),
        age: P.number(),
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

    runParsingTests(parser, tests);
  });
});
