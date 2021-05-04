import { ParsedType, V } from "../../src";

const ArgumentSchema = V.isObject().withProperties({
  verbose: V.isBoolean().defaultedTo(false),
  files: V.isArray()
    .of(V.isString().trimmed())
    .filtered((s) => s.length > 0)
    .minLength(1),
});

type Arguments = ParsedType<typeof ArgumentSchema>;

const argv = Arguments.parse(
  process.argv.slice(2).reduce<Partial<Arguments>>((obj, arg) => {
    if (arg === "--verbose") {
      obj.verbose = true;
    } else {
      obj.files = obj.files ? [...obj.files, arg] : [arg];
    }
  }, {})
);
