import { FluentParserImpl } from "./base";
import { resolveErrorDetails } from "./errors";
import {
  FluentArrayParser,
  FluentParsingRoot,
  Parser,
  ParseResult,
  ValidationErrorDetails,
  ValidationFunction,
} from "./types";
import { composeValidators } from "./utils";

const INVALID_TYPE_PARSE_RESULT: ParseResult<unknown[]> = {
  success: false,
  errors: [
    { code: "invalidType", message: "input must be an array", path: [] },
  ],
};

export const defaultArrayParser = {
  type: "array",
  parse(input: unknown): ParseResult<unknown[]> {
    if (!Array.isArray(input)) return INVALID_TYPE_PARSE_RESULT;

    return { success: true, errors: [], value: input };
  },
};

export class FluentArrayParserImpl<ItemType>
  extends FluentParserImpl<ItemType[], FluentArrayParser<ItemType>>
  implements FluentArrayParser<ItemType> {
  constructor(root: FluentParsingRoot, parser: Parser<ItemType[]>) {
    super(root, parser, FluentArrayParserImpl);
  }

  allItemsPass(
    validators: ValidationFunction<ItemType> | ValidationFunction<ItemType>[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType> {
    const itemValidator = composeValidators(validators);

    return this.passes((input: ItemType[]) => {
      const errors = input.reduce<ValidationErrorDetails[]>(
        (errors, item, index) => {
          const itemResult = itemValidator(item);

          if (itemResult === false) {
            const [code, message] = resolveErrorDetails(
              "allItemsPass",
              "all items in input array must pass the check",
              errorCode,
              errorMessage
            );

            errors.push({
              code,
              message,
              path: [index],
            });
            return errors;
          } else if (Array.isArray(itemResult)) {
            errors.push(
              ...itemResult.map((e) => ({
                ...e,
                path: [...e.path, index],
              }))
            );
          } else if (itemResult !== true) {
            errors.push({
              ...itemResult,
              path: [...itemResult.path, index],
            });
          }

          return errors;
        },
        []
      );

      return errors.length === 0 || errors;
    });
  }

  filtered(
    predicate: (item: ItemType, index: number, array: ItemType[]) => boolean
  ): FluentArrayParser<ItemType> {
    return this.normalizedWith((array) => array.filter(predicate));
  }

  mapped<NextItemType>(
    callback: (item: ItemType, index: number, array: ItemType[]) => NextItemType
  ): FluentArrayParser<NextItemType> {
    const nextParser: Parser<NextItemType[]> = {
      parse: (input: unknown): ParseResult<NextItemType[]> => {
        const parsed = this.parse(input);
        if (!parsed.success) {
          return parsed;
        }
        return {
          success: true,
          errors: [],
          value: parsed.value.map(callback),
        };
      },
    };
    return new FluentArrayParserImpl<NextItemType>(this.root, nextParser);
  }

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType> {
    return this.passes(
      (input) => input.length <= value,
      errorCode ?? "maxLength",
      errorMessage ?? `input must be an array of no more than ${value} item(s)`
    );
  }

  minLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayParser<ItemType> {
    return this.passes(
      (input) => input.length >= value,
      errorCode ?? "minLength",
      errorMessage ?? `input must be an array of at least ${value} item(s)`
    );
  }

  of<NextItemType extends ItemType>(
    validator: Parser<NextItemType>
  ): FluentArrayParser<NextItemType> {
    const nextParser = {
      parse: (input: unknown): ParseResult<NextItemType[]> => {
        const parsed = this.parse(input);
        if (!parsed.success) {
          return parsed;
        }

        // TODO: Optimize this reduce()

        return parsed.value.reduce<ParseResult<NextItemType[]>>(
          (result, item, index) => {
            const itemParse = validator.parse(item);
            if (itemParse.success) {
              if (result.success) {
                return {
                  success: true,
                  errors: [],
                  value: [...result.value, itemParse.value],
                };
              } else {
                return result;
              }
            }

            return {
              success: false,
              errors: [
                ...result.errors,
                ...itemParse.errors.map((e) => ({
                  ...e,
                  path: [...e.path, index],
                })),
              ],
            };
          },
          { success: true, errors: [], value: [] }
        );
      },
    };

    return new FluentArrayParserImpl(this.root, nextParser);
  }
}
