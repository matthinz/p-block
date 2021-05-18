import { combineErrorLists } from "./errors";
import { FluentParsingRoot, Parser, ParseResult } from "./types";

export class AndParser<Left, Right> implements Parser<Left & Right> {
  constructor(
    private readonly root: FluentParsingRoot,
    private readonly left: Parser<Left>,
    private readonly right: Parser<Right>
  ) {}

  parse(input: any): ParseResult<Left & Right> {
    const leftResult = this.left.parse(input);
    const rightResult = this.right.parse(input);

    if (!leftResult.success && !rightResult.success) {
      return {
        success: false,
        errors: combineErrorLists(
          [leftResult.errors, rightResult.errors],
          (x, y) => {
            if (x.message === y.message) {
              return x;
            }

            return {
              ...x,
              message: `${x.message} AND ${y.message}`,
            };
          }
        ),
      };
    } else if (!leftResult.success) {
      return leftResult;
    } else if (!rightResult.success) {
      return rightResult;
    }

    const leftValue = leftResult.parsed;
    const rightValue = rightResult.parsed;

    switch (typeof leftValue) {
      case "bigint":
      case "boolean":
      case "function":
      case "number":
      case "string":
      case "symbol":
        return combineUsingEquality<Left, Right, typeof leftValue>(
          typeof leftValue,
          leftValue,
          rightValue
        );
      case "object":
      case "undefined":
        return combineObjects(this.root, leftValue, rightValue);
      default:
        throw new Error(`Could not handle input of type '${typeof leftValue}'`);
    }
  }
}

function combineUsingEquality<Left, Right, Type>(
  type: string,
  leftValue: Left & Type,
  rightValue: Right,
  comparer?: (left: Left & Type, right: Right) => boolean
): ParseResult<Left & Right> {
  if (typeof rightValue !== type) {
    throw new Error();
  }

  comparer =
    comparer ??
    ((left, right) => (left as Type) === ((right as unknown) as Type));

  if (comparer(leftValue, rightValue)) {
    return {
      success: true,
      errors: [],
      parsed: (leftValue as unknown) as Left & Right,
    };
  }

  throw new Error(
    "Parsers generated different outputs of the same types that could not be reconciled"
  );
}

function combineObjects<Left, Right>(
  root: FluentParsingRoot,
  left: Left,
  right: Right
): ParseResult<Left & Right> {
  if (left == null && right == null) {
    return {
      success: true,
      errors: [],
      parsed: (undefined as unknown) as Left & Right,
    };
  }

  const leftParse = root.object().parse(left);
  const rightParse = root.object().parse(right);
  if (leftParse.success && rightParse.success) {
    return {
      success: true,
      errors: [],
      parsed: ({
        ...leftParse.parsed,
        ...rightParse.parsed,
      } as unknown) as Left & Right,
    };
  }

  throw new Error();
}
