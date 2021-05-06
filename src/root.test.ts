import { Root } from "./root";

describe("Root", () => {
  test("can separate functions from object", () => {
    const root = new Root();
    const { isString } = root;
    const result = isString().trimmed().parse("  foo  ");
    expect(result).toHaveProperty("success", true);
  });
});
