import { FluentParsingRootImpl } from "./root";
import { FluentParsingRoot } from "./types";

export {
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
} from "./types";

export const P: FluentParsingRoot = new FluentParsingRootImpl();
