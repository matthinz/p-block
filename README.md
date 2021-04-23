## Design Goals

- Favor invariant error codes over localized error messages
  - Error messages could change at any minute
- Allow overriding default behavior
- Don't require exception throwing
- Include data normalization (filling in default values, etc)
- Errors are machine-readable


## TODOs

- Cover JSON types (string, number, array, object, null)
- `StringValidator.parsedAs<T>(input: Type => T)`
- ~~`StringValidator.parsedAsDate(parser?: (input: string) => Date | undefined)`~~
- `StringValidator.parsedAsBignum`
- ~~`ObjectValidator.defaultedTo({})`~~
- ~~`isBoolean()`~~
- `is<T>(input: any => input is T): FluentValidator<T>`
- ~~`isArray()`~~
- Use enum for standard error codes (but don't limit to only those)
- Required property validation should include property in path (think highlighting on the frontend)
- Enum validation -- is this even possible?
- UTC conversion as a Date normalization
- If errorCode provided but not errorMessage, use errorCode as errorMessage
- ~~`StringValidator.parsedAsBoolean` -- use YAML boolean values (YES, etc.)~~
  - This is [YAML 1.1](https://yaml.org/type/bool.html). YAML 1.2 allows only `true` or `false`
- `notEmpty` is just an alias for `minLength(1)` -- should use same error code
- `normalizedWith` should only take strongly-typed normalization functions
- `all()`, `any()`, `not()` -- basic logical validators
