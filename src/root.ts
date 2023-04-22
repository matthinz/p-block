import { AndParser } from "./and";
import { defaultArrayParser, FluentArrayParserImpl } from "./array";
import { FluentParserImpl } from "./base";
import { FluentBooleanParserImpl } from "./boolean";
import { FluentDateParserImpl } from "./date";
import { nullishParser } from "./nullish";
import { FluentNumberParserImpl } from "./number";
import { defaultObjectParser, FluentObjectParserImpl } from "./object";
import { OrParser } from "./or";
import { FluentStringParserImpl } from "./string";
import {
  FluentArrayParser,
  FluentBooleanParser,
  FluentDateParser,
  FluentNumberParser,
  FluentObjectParser,
  FluentParser,
  FluentParsingRoot,
  FluentStringParser,
  FluentURLParser,
  ParsedType,
  Parser,
  UnionToIntersection,
} from "./types";
import { unknownParser } from "./unknown";
import { FluentURLParserImpl } from "./url";

export class FluentParsingRootImpl implements FluentParsingRoot {
  private arrayParser: FluentArrayParser<unknown> = new FluentArrayParserImpl(
    this,
    defaultArrayParser
  );
  private booleanParser: FluentBooleanParser = new FluentBooleanParserImpl(
    this
  );
  private dateParser: FluentDateParser = new FluentDateParserImpl(this);
  private integerParser: FluentNumberParser = new FluentNumberParserImpl(
    this
  ).truncated();
  private nullishParser: FluentParser<undefined> = new FluentParserImpl<
    undefined,
    FluentParser<undefined>
  >(this, nullishParser);
  private numberParser: FluentNumberParser = new FluentNumberParserImpl(this);
  private objectParser: FluentObjectParser<
    Record<string, unknown>
  > = new FluentObjectParserImpl(this, defaultObjectParser);
  private stringParser: FluentStringParser<string> = new FluentStringParserImpl(
    this
  );
  private unknownParser: FluentParser<unknown> = new FluentParserImpl<
    unknown,
    FluentParser<unknown>
  >(this, unknownParser);
  private urlParser: FluentURLParser = new FluentURLParserImpl(this);

  allOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParser<UnionToIntersection<ParsedType<Parsers[number]>>> {
    if (parsers.length < 1) {
      throw new Error();
    }

    const parser = parsers.reduce<Parser<unknown>>((result, parser) => {
      return new AndParser(this, result, parser);
    }, this.unknown());

    return new FluentParserImpl(this, parser) as FluentParser<
      UnionToIntersection<ParsedType<Parsers[number]>>
    >;
  }

  anyOf<Parsers extends Parser<unknown>[]>(
    ...parsers: Parsers
  ): FluentParser<ParsedType<Parsers[number]>> {
    const parser = parsers.reduce<Parser<unknown> | undefined>(
      (result, parser) => {
        return result ? new OrParser(result, parser) : parser;
      },
      undefined
    );

    if (!parser) {
      throw new Error("anyOf() requires at least one argument");
    }

    return new FluentParserImpl(this, parser) as FluentParser<
      ParsedType<Parsers[number]>
    >;
  }

  array<ItemType>(itemParser?: Parser<ItemType>): FluentArrayParser<ItemType> {
    if (itemParser === undefined) {
      return this.arrayParser as FluentArrayParser<ItemType>;
    }
    return this.arrayParser.of(itemParser);
  }

  boolean = () => this.booleanParser;
  date = () => this.dateParser;
  integer = () => this.integerParser;
  nullish = () => this.nullishParser;
  number = () => this.numberParser;
  object = () => this.objectParser;
  string = () => this.stringParser;
  unknown = () => this.unknownParser;
  url = () => this.urlParser;
}
