import { P } from "p-block";

const EnvironmentVariables = P.object().withProperties({
  NODE_ENV: P.string()
    .isIn(["development", "production"])
    .defaultedTo("production"),
  PORT: P.integer().greaterThan(0).defaultedTo(3000),
  LOG_LEVEL: P.string()
    .isIn(["debug", "info", "warn", "error"])
    .defaultedTo("info"),
});

const options = EnvironmentVariables.parse(process.env);

options.errors.forEach(({ code, message }) => {
  console.error("%s: %s", code, message);
});

if (options.success) {
  console.log(options.value);
}

process.exitCode = options.errors.length;
