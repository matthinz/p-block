import { V } from "../../src";

const EnvironmentVariables = V.isObject().withProperties({
  NODE_ENV: V.isString()
    .isIn(["development", "production"])
    .defaultedTo("production"),
  PORT: V.isNumber().greaterThan(0).defaultedTo(3000),
  LOG_LEVEL: V.isString()
    .isIn(["debug", "info", "warn", "error"])
    .defaultedTo("info"),
});

const options = EnvironmentVariables.parse(process.env);

options.errors.forEach(({ code, message }) => {
  console.error("%s: %s", code, message);
});

if (options.success) {
  console.log(options.parsed);
}

process.exitCode = options.errors.length;
