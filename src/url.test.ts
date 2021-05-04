import { V } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("isURL()", () => {
  describe("stock", () => {
    const validator = V.isURL();
    const tests: ParsingTest<URL>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["http://www.example.org", false, "invalidType"],
      [new URL("http://www.example.org"), true],
    ];

    runParsingTests(validator, tests);
  });

  describe("httpOrHttpsOnly()", () => {
    const validator = V.isURL().httpOrHttpsOnly();
    const tests: ParsingTest<URL>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["http://www.example.org", false, "invalidType"],
      [
        new URL("ftp://example.org"),
        false,
        "invalidProtocol",
        "input must be a URL using protocol 'http:' or 'https:'",
      ],
      [new URL("http://www.example.org"), true],
      [new URL("https://www.example.org"), true],
    ];

    runParsingTests(validator, tests);
  });

  describe("httpsOnly()", () => {
    const validator = V.isURL().httpsOnly();
    const tests: ParsingTest<URL>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["http://www.example.org", false, "invalidType"],
      [
        new URL("ftp://example.org"),
        false,
        "invalidProtocol",
        "input must be a URL using protocol 'https:'",
      ],
      [new URL("http://www.example.org"), false],
      [new URL("https://www.example.org"), true],
    ];

    runParsingTests(validator, tests);
  });

  describe("protocolEqualTo", () => {
    describe("single value", () => {
      const validator = V.isURL().protocolEqualTo("https:");
      const tests: ParsingTest<URL>[] = [
        [undefined, false, "invalidType"],
        [null, false, "invalidType"],
        ["http://www.example.org", false, "invalidType"],
        [
          new URL("http://www.example.org"),
          false,
          "invalidProtocol",
          "input must be a URL using protocol 'https:'",
        ],
        [new URL("https://www.example.org"), true],
      ];

      runParsingTests(validator, tests);
    });

    describe("multiple values", () => {
      const validator = V.isURL().protocolEqualTo(["https:", "http://"]);
      const tests: ParsingTest<URL>[] = [
        [undefined, false, "invalidType"],
        [null, false, "invalidType"],
        ["http://www.example.org", false, "invalidType"],
        [
          new URL("ftp://example.org"),
          false,
          "invalidProtocol",
          "input must be a URL using protocol 'https:' or 'http:'",
        ],
        [new URL("http://www.example.org"), true],
        [new URL("https://www.example.org"), true],
      ];

      runParsingTests(validator, tests);
    });
  });
});
