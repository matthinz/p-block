import { FluentParserImpl } from "./base";
import {
  FluentParser,
  FluentParsingRoot,
  FluentURLParser,
  KnownProtocol,
  Parser,
  ParseResult,
} from "./types";
import {
  createFailedParseResult,
  createInvalidTypeParseResult,
  deepFreeze,
  NO_ERRORS,
  resolveErrorDetails,
} from "./utils";

// XXX: URL is a global in Node.js as of 10.0.0. Rather than bring in
//      the whole "dom" lib, here's the piece we actually use of it.
interface URL {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  toString(): string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  toJSON(): string;
}

// eslint-disable-next-line no-var
declare var URL: {
  prototype: URL;
  new (url: string, base?: string | URL): URL;
  createObjectURL(object: any): string;
  revokeObjectURL(url: string): void;
};

const INVALID_TYPE_PARSE_RESULT = createInvalidTypeParseResult<URL>("URL");

export const defaultURLParser: Parser<URL> = {
  parse(input: unknown): ParseResult<URL> {
    if (input instanceof URL) {
      return {
        success: true,
        errors: NO_ERRORS,
        value: input,
      };
    }
    return INVALID_TYPE_PARSE_RESULT;
  },
};

export class FluentURLParserImpl
  extends FluentParserImpl<URL, FluentURLParser>
  implements FluentURLParser {
  constructor(root: FluentParsingRoot, parser?: Parser<URL>) {
    super(root, parser ?? defaultURLParser, FluentURLParserImpl);
  }

  basedOn(base: string | URL): FluentParser<URL> {
    return this.normalizedWith((url) => new URL(url.toString(), base));
  }

  httpOrHttpsOnly(
    errorCode?: string,
    errorMessage?: string
  ): FluentParser<URL> {
    return this.protocolEqualTo(["http", "https"], errorCode, errorMessage);
  }

  httpsOnly(errorCode?: string, errorMessage?: string): FluentParser<URL> {
    return this.protocolEqualTo("https", errorCode, errorMessage);
  }

  protocolEqualTo(
    protocol: KnownProtocol | string | (KnownProtocol | string)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentParser<URL> {
    const protocols = (Array.isArray(protocol) ? protocol : [protocol]).map(
      (p) => p.replace(/:(\/\/)?$/, "") + ":"
    );

    [errorCode, errorMessage] = resolveErrorDetails(
      "invalidProtocol",
      `input must be a URL using protocol ${protocols
        .map((p) => `'${p}'`)
        .join(" or ")}`,
      errorCode,
      errorMessage
    );

    return this.passes(
      (url: URL) => protocols.includes(url.protocol),
      errorCode,
      errorMessage
    );
  }
}
