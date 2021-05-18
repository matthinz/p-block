import path from "path";
import { ParsedType, P } from "../../src";

const ArgumentSchema = P.object().withProperties({
  verbose: P.boolean().defaultedTo(false),
  files: P.array()
    .of(P.string().trimmed())
    .filtered((s) => s.length > 0)
    .mapped((file) => path.resolve(file))
    .minLength(1),
});

type Arguments = ParsedType<typeof ArgumentSchema>;

const argv = ArgumentSchema.parse(
  process.argv.slice(2).reduce<Partial<Arguments>>((obj, arg) => {
    if (arg === "--verbose") {
      obj.verbose = true;
    } else {
      obj.files = obj.files ? [...obj.files, arg] : [arg];
    }
    return obj;
  }, {})
);

argv.errors.forEach(({ code, message }) =>
  console.error("%s: %s", code, message)
);

if (argv.success) {
  console.log(argv.parsed);
}

process.exitCode = argv.errors.length;
