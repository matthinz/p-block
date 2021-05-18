import { P } from ".";
import { ParsingTest, runParsingTests } from "./test-utils";

describe("url()", () => {
  describe("stock", () => {
    const parser = P.url();
    const tests: ParsingTest<URL>[] = [
      [undefined, false, "invalidType"],
      [null, false, "invalidType"],
      ["http://www.example.org", false, "invalidType"],
      [new URL("http://www.example.org"), true],
    ];

    runParsingTests(parser, tests);
  });

  describe("httpOrHttpsOnly()", () => {
    const parser = P.url().httpOrHttpsOnly();
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

    runParsingTests(parser, tests);
  });

  describe("httpsOnly()", () => {
    const parser = P.url().httpsOnly();
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

    runParsingTests(parser, tests);
  });

  describe("protocolEqualTo", () => {
    describe("single value", () => {
      const parser = P.url().protocolEqualTo("https:");
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

      runParsingTests(parser, tests);
    });

    describe("multiple values", () => {
      const parser = P.url().protocolEqualTo(["https:", "http://"]);
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

      runParsingTests(parser, tests);
    });
  });
});
