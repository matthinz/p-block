import { BasicValidator } from "./basic";
import { resolveErrorDetails } from "./errors";
import {
  FluentValidator,
  NormalizationFunction,
  NormalizerArgs,
  Parser,
  ParseResult,
  ParsingFunction,
  ValidationErrorDetails,
  ValidationFunction,
  Validator,
  ValidatorArgs,
} from "./types";
import {
  applyErrorDetails,
  buildParsingFunction,
  composeValidators,
} from "./utils";

export interface FluentArrayValidator<ItemType>
  extends FluentValidator<ItemType[]> {
  allItemsPass(
    validator: ValidationFunction<ItemType> | Validator<ItemType>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  defaultedTo(value: ItemType[]): FluentArrayValidator<ItemType>;

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  minLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;

  normalizedWith(
    normalizer: NormalizerArgs<ItemType[]>
  ): FluentArrayValidator<ItemType>;

  /**
   * @returns A new Array validator, derived from this one, that runs a further type check on its items.
   */
  of<NextItemType extends ItemType>(
    validator: Validator<NextItemType>
  ): FluentArrayValidator<NextItemType>;

  /**
   * @param validators
   * @param errorCode Error code assigned to any errors generated.
   * @param errorMessage Error message returned with any errors generated.
   * @returns A new FluentValidator that requires input to pass all of `validators`.
   */
  passes(
    validators: ValidatorArgs<ItemType[]>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType>;
}

export class ArrayValidator<ItemType>
  extends BasicValidator<ItemType[], FluentArrayValidator<ItemType>>
  implements FluentArrayValidator<ItemType> {
  constructor(
    parser: ParsingFunction<ItemType[]>,
    normalizer?: NormalizationFunction<ItemType[]>,
    validator?: ValidationFunction<ItemType[]>
  ) {
    super(ArrayValidator, parser, normalizer, validator);
  }

  defaultedTo(value: ItemType[]): FluentArrayValidator<ItemType> {
    const nextParser = (input: unknown): ParseResult<ItemType[]> => {
      if (input == null) {
        return {
          success: true,
          errors: [],
          parsed: value,
        };
      }

      return this.parser(input);
    };

    return new ArrayValidator(nextParser, this.normalizer, this.validator);
  }

  allItemsPass(
    validators:
      | ValidationFunction<ItemType>
      | Validator<ItemType>
      | (ValidationFunction<ItemType> | Validator<ItemType>)[],
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    const itemValidator = composeValidators(validators);

    const nextValidator = composeValidators(
      this.validator,
      (input: ItemType[]) => {
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
      }
    );

    return new ArrayValidator(
      this.parser,
      this.normalizer,
      composeValidators(this.validator, nextValidator)
    );
  }

  maxLength(
    value: number,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
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
  ): FluentArrayValidator<ItemType> {
    return this.passes(
      (input) => input.length >= value,
      errorCode ?? "minLength",
      errorMessage ?? `input must be an array of at least ${value} item(s)`
    );
  }

  of<NextItemType extends ItemType>(
    validator: Validator<NextItemType>
  ): FluentArrayValidator<NextItemType> {
    const nextParser = (input: unknown): ParseResult<NextItemType[]> => {
      const parsed = this.parse(input);
      if (!parsed.success) {
        return parsed;
      }

      // TODO: Optimize this reduce()

      return parsed.parsed.reduce<ParseResult<NextItemType[]>>(
        (result, item, index) => {
          const itemParse = validator.parse(item);
          if (itemParse.success) {
            if (result.success) {
              return {
                success: true,
                errors: [],
                parsed: [...result.parsed, itemParse.parsed],
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
        { success: true, errors: [], parsed: [] }
      );
    };

    return new ArrayValidator(nextParser);
  }

  passes(
    validators: ValidatorArgs<ItemType[]>,
    errorCode?: string,
    errorMessage?: string
  ): FluentArrayValidator<ItemType> {
    return new ArrayValidator<ItemType>(
      this.parser,
      this.normalizer,
      applyErrorDetails(
        composeValidators(this.validator, validators),
        "invalid",
        "input was invalid",
        errorCode,
        errorMessage
      )
    );
  }
}

export function defaultArrayParser(input: unknown): ParseResult<unknown[]> {
  if (!Array.isArray(input))
    return {
      success: false,
      errors: [
        { code: "invalidType", message: "input must be an array", path: [] },
      ],
    };

  return { success: true, errors: [], parsed: input };
}
