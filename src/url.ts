import { V } from ".";
import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  ParsingFunction,
  ValidationFunction,
} from "./types";
import { createDefaultParser } from "./utils";

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

export type KnownProtocol = "http:" | "https:" | "ftp:" | "mailto:";

export interface FluentUrlValidator extends FluentValidator<URL> {
  /**
   * Validates that the incoming URL is using the HTTP or HTTPS protocol.
   */
  httpOrHttpsOnly(
    errorCode?: string,
    errorMessage?: string
  ): FluentUrlValidator;

  /**
   * Validates that the incoming URL is using the HTTPS protocol.
   */
  httpsOnly(errorCode?: string, errorMessage?: string): FluentUrlValidator;

  /**
   * Validates that the incoming URL uses the given protocol. If more than
   * one is specified, validation will pass if the URL uses any of them.
   */
  protocolEqualTo(
    protocol: KnownProtocol | string | (KnownProtocol | string)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentUrlValidator;
}

export class UrlValidator
  extends BasicValidator<URL, FluentUrlValidator>
  implements FluentUrlValidator {
  constructor(
    parser?: ParsingFunction<URL>,
    normalizer?: NormalizationFunction<URL>,
    validator?: ValidationFunction<URL>
  ) {
    super(
      UrlValidator,
      parser ?? createDefaultParser(URL),
      normalizer,
      validator
    );
  }

  basedOn(base: string | URL): FluentUrlValidator {
    return this.normalizedWith((url) => new URL(url.toString(), base));
  }

  httpOrHttpsOnly(
    errorCode?: string,
    errorMessage?: string
  ): FluentUrlValidator {
    return this.protocolEqualTo(["http", "https"], errorCode, errorMessage);
  }

  httpsOnly(errorCode?: string, errorMessage?: string): FluentUrlValidator {
    return this.protocolEqualTo("https", errorCode, errorMessage);
  }

  protocolEqualTo(
    protocol: KnownProtocol | string | (KnownProtocol | string)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentUrlValidator {
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
