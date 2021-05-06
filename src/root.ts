import { AlwaysValidator } from "./always";
import { AndValidator } from "./and";
import {
  ArrayValidator,
  defaultArrayParser,
  FluentArrayValidator,
} from "./array";
import { BooleanValidator, FluentBooleanValidator } from "./boolean";
import { DateValidator, FluentDateValidator } from "./date";
import { FluentNullishParser, NullishParser } from "./nullish";
import { FluentNumberValidator, NumberValidator } from "./number";
import {
  defaultObjectParser,
  FluentObjectValidator,
  ObjectValidator,
} from "./object";
import { OrValidator } from "./or";
import { FluentStringValidator, StringValidator } from "./string";
import { Parser } from "./types";
import { FluentUrlValidator, UrlValidator } from "./url";

export interface FluentParsingRoot {
  allOf<Type>(...parsers: (Parser<Type> | Parser<Type>[])[]): Parser<Type>;
  anyOf<Type>(...parsers: (Parser<Type> | Parser<Type>[])[]): Parser<Type>;
  isArray(): FluentArrayValidator<unknown>;
  isBoolean(): FluentBooleanValidator;
  isDate(): FluentDateValidator;
  isNullish(): FluentNullishParser;
  isNumber(): FluentNumberValidator;
  isObject(): FluentObjectValidator<Record<string, unknown>>;
  isString(): FluentStringValidator;
  isURL(): FluentUrlValidator;
}

export class Root implements FluentParsingRoot {
  private readonly arrayParser: FluentArrayValidator<unknown> = new ArrayValidator<unknown>(
    defaultArrayParser
  );
  private readonly booleanParser: FluentBooleanValidator = new BooleanValidator();
  private readonly dateParser: FluentDateValidator = new DateValidator();
  private readonly nullishParser: FluentNullishParser = new NullishParser();
  private readonly numberParser: FluentNumberValidator = new NumberValidator();
  private readonly objectParser: FluentObjectValidator<
    Record<string, unknown>
  > = new ObjectValidator(defaultObjectParser);
  private readonly stringParser: FluentStringValidator = new StringValidator();
  private readonly urlParser: FluentUrlValidator = new UrlValidator();

  allOf<Type>(...parsers: (Parser<Type> | Parser<Type>[])[]): Parser<Type> {
    const reducer = (
      result: Parser<Type> | undefined,
      parser: Parser<Type> | Parser<Type>[]
    ): Parser<Type> | undefined => {
      if (Array.isArray(parser)) {
        if (parser.length === 0) {
          return result;
        } else if (parser.length === 1) {
          return result ? new AndValidator(result, parser[0]) : parser[0];
        }
        parser = this.allOf(...parser);
      }
      return result === undefined ? parser : new AndValidator(result, parser);
    };
    return parsers.reduce(reducer, undefined) ?? new AlwaysValidator();
  }

  anyOf<Type>(...parsers: (Parser<Type> | Parser<Type>[])[]): Parser<Type> {
    const reducer = (
      result: Parser<Type> | undefined,
      parser: Parser<Type> | Parser<Type>[]
    ): Parser<Type> | undefined => {
      if (Array.isArray(parser)) {
        if (parser.length === 0) {
          return result;
        } else if (parser.length === 1) {
          return result ? new OrValidator(result, parser[0]) : parser[0];
        }
        parser = this.allOf(...parser);
      }
      return result === undefined ? parser : new OrValidator(result, parser);
    };
    return parsers.reduce(reducer, undefined) ?? new AlwaysValidator();
  }

  isArray = () => this.arrayParser;
  isBoolean = () => this.booleanParser;
  isDate = () => this.dateParser;
  isNullish = () => this.nullishParser;
  isNumber = () => this.numberParser;
  isObject = () => this.objectParser;
  isString = () => this.stringParser;
  isURL = () => this.urlParser;
}
