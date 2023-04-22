# Notes

Random thoughts on things to do

## CI

- Build (Latest Node)
  - Install deps
  - Lint
  - Build .js
- Unit Test (Nodes 10, 12, 14, 16, Typescripts 2, 3, 4)
  - Install deps
  - Run tests using compiled .JS
- Integration Test (Nodes 10, 12, 14, 16)
  - Link
  - Run each example
- Release (using `semantic-release`?)

## TODOs / Improvements

- Generalized `parsedAs` -- allow converting type
- Allow overriding error codes / messages
- UUID support -- `parsedAsUUID` should parse + normalize to e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (inserting dashes, lowercasing)
- JSON schema
- Documentation
  - Error codes
  - Summary + example for every method
- `P.object({})` should be a shortcut for `P.object().withProperties({})`
- Result should have a way to generate an `Error`
- `P.object().defaultedTo({})` should get proper type-checking (with `Partial<>`)
