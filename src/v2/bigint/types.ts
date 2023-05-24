import { FluentComparableParserMethods } from "../comparable/types";
import { Parser } from "../shared/types";

export interface FluentBigIntParser<T extends bigint>
  extends FluentBigIntParserMethods<T>,
    Parser<T> {}

export interface FluentBigIntParserMethods<T extends bigint>
  extends FluentComparableParserMethods<T, FluentBigIntParser<T>> {}
