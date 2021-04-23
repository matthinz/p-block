import { V } from ".";
import { runNormalizationTests, runValidationTests } from "./test-utils";
import { Path } from "./types";

describe("isObject()", () => {
  describe("withProperties", () => {
    const validator = V.isObject().withProperties({
      firstName: V.isString(),
      lastName: V.isString(),
    });

    const tests: [
      any,
      boolean,
      (string | string[])?,
      (string | string[])?,
      (Path | Path[])?
    ][] = [
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

    runValidationTests(validator, tests);
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

    const tests: [any, boolean, string[]?, string[]?, Path[]?][] = [
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
        [["address"], ["address"], ["address"], ["address"]],
      ],
    ];

    runValidationTests(validator, tests);
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

    const tests: [any, any, boolean][] = [
      [undefined, undefined, false],
      [null, null, false],
      [123, 123, false],
      [{}, { name: "Chris Exampleton" }, false],
      [
        { name: "Pat Exampleton", age: 99 },
        { name: "Pat Exampleton", age: 99 },
        true,
      ],
      [{ age: 99 }, { name: "Chris Exampleton", age: 99 }, true],
    ];

    runNormalizationTests(validator, tests);
  });
});
