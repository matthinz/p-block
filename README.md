# p-block

> Turns the bricks into coins and the coins into bricks.

`p-block` is a small Typescript library that turns unknown input into structured, strongly-typed data. It is meant to provide a bridge between a source of `unknown` or `any`-typed data (API request bodies, JSON or YAML files, etc.) and your app's domain objects. It makes it easier to write code that adheres to the [**robustness principle**][robustness]: "be conservative in what you do, be liberal in what you accept from others."

[robustness]: https://datatracker.ietf.org/doc/html/rfc761#section-2.10

In bullet points, `p-block` provides a fluent interface for building parsers that:

- Translate unknown user input into strongly-typed Typescript structures
- Normalize user input, for example stripping leading / trailing whitespace, truncating decimal portions from integers, or applying custom normalizations
- Provide detailed error information when parsing fails

## How It Works

```typescript
import { P } from "p-block";

const userParser = P.object({
  name: P.string(),
  email: P.string(),
  birthDate: P.date(),
});

const parsed = userParser.parse(someSourceOfInput());

if (parsed.success) {
  const user = parsed.value;
  console.log(user.name, user.email, user.birthDate);
} else {
  parsed.errors.forEach(err => console.error(err.code, err.message, err.path));
}
```

`p-block`'s entry point is `P`. Each of the methods on `P` returns a `FluentParser`, which can be refined by calling methods to return new parser instances.

Once you have a configured `FluentParser`, use the `parse()` method to process your input. `parse()` returns a `ParsedResult`. After checking that `.success` is `true`, you can access the parsed data via `.value`. If `success` is `false`, you can access the errors via the `.errors` property.

## Validation

All parsers validate input as they process it. You can add more validation rules when you are creating your parser:

```typescript
const userParser = P.object({
  name: P.string().maxLength(255),
  email: P.string().maxLength(255).matches(/@/),
  birthDate: P.date().lessThan(new Date(2020, 0, 1)),
})
```

Validation rules are evaluated in order. For example, given the following:

```typescript
const emailParser = P.string().maxLength(255).matches(/@/);
```

`emailParser` verifies that any input passes the following checks:

1. Is the input a string?
2. Is the input less than or equal to 255 characters long?
3. Does the input match the regular expression `/@/`?

If any of these checks fails, the parse operation will fail and return errors describing what went wrong.

Several built-in validation rules are available, but you can always write your own using the `.passes()` method:

```typescript
const passwordParser = P.string().passes(
  input => input !== "password",
  "passwordCantLiterallyBePassword",
  "'password' is not a valid password"
```

`passes()` accepts three arguments:

1. A function to validate the input (which must return `true` or `false`)
2. An invariant error code used to identify the error if the check fails
3. An error message describing what went wrong.

## Normalization

Incoming data can be normalized before validation. `p-block` includes several common normalizations, including:

- `.trimmed()` (strings) -- Remove leading and trailing whitespace
- `.rounded()` (numbers) -- Rounds input to a specific number of decimal places
- `.truncated()` (numbers) -- Removes the decimal component of an input (similar to `parseInt`)
- `.filtered()` (arrays) -- Filters the contents of an array input using a predicate
- `.mapped()` (arrays) -- Transforms the contents of an array input using a callback

(Side note: normalization methods names always use the past tense.)

Additionally, you can do your own custom normalizations using `normalizedWith()`:

```typescript
const reversingParser = P.string().normalizedWith(input => input.split('').reverse().join(''));

const parsed = reversingParser.parse("hello");

if (parsed.success) {
  console.log(parsed.value) // "olleh"
}
```

**Important note:** Normalizers cannot change the type of their input.

## Handling Errors

If parsing fails, the `errors` array on the parse result will include a set of objects describing the error(s) encountered. Each of those will include the following properties:

| Property | Type | Description |
| -- | -- | -- |
| `code` | `string` | An invariant error code identifying the kind of error encountered. By default, `code` will be the name of the validation method that caused the error (for example `maxLength` or `matches`). |
| `message` | `string` | A short description (in English) describing the error encountered. `p-block` keeps these intentionally robotic-sounding--you probably don't want to display them to your users. Instead, consider mapping `code` to some friendlier error messages. |
| `path` | `Array<string|number>` | The path to the field in the input that caused the error. |

## Parsing JSON

`p-block` provides support for several types that are not part of the JSON specification, including:

- `Date`
- WHATWG `URL`

If you are loading data from JSON documents, you probably are representing these types of data using `string`. `FluentStringParser` provides helper methods for translating string fields into these types of objects:

```typescript
import { P } from "p-block";

const historyParser = P.object({
  date: P.string().parsedAsDate(),
  url: P.string().parsedAsURL(),
});
```

## Differences from Native Javascript

`p-block` makes a few opinionated choices about how it interprets input, including:

### `NaN`, `Infinity`, and `-Infinity` rejected by default

If you use `P.number()` or `P.integer()`, attempting to parse any of the following will fail, despite the fact they are valid `number` values:

- `NaN`
- `Infinity`
- `-Infinity`

### `Invalid Date` rejected by default

Likewise, attempting to parse a `Date` instance whose `getTime()` returns `NaN` will fail.

### `YYYY-MM-DD` formatted dates in local timezone

When using `FluentStringParser.parsedAsDate` to parse a date in the format `YYYY-MM-DD`, the resulting date will be in the local timezone rather than in UTC.

## Influences and Prior Art

This library borrows several good ideas from the amazing [zod][zod] library. Additionally it was influenced by the .NET [FluentValidation][fluent-validation] library.

[zod]: https://github.com/colinhacks/zod
[fluent-validation]: https://fluentvalidation.net/
