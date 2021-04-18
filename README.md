## Design Goals

- Favor invariant error codes over localized error messages
  - Error messages could change at any minute
- Allow overriding default behavior
- Don't require exception throwing
- Include data normalization (filling in default values, etc)
- Errors are machine-readable


## TODOs

- `parsedAs<T>(input: Type => T)`
- `parsedAsDate(parser?: (input: string) => Date | undefined)`
- `defaultedTo({})`
- `isBoolean()`
- `is<T>(input: any => input is T): FluentValidator<T>`
- `isArray()`
- Use enum for standard error codes (but don't limit to only those)
