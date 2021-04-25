import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  roots: ["src"],
  testEnvironment: "node",
};

export default config;
