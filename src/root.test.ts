import { FluentParsingRootImpl } from "./root";

describe("Root", () => {
  test("can separate functions from object", () => {
    const root = new FluentParsingRootImpl();
    const { string } = root;
    const result = string().trimmed().parse("  foo  ");
    expect(result).toHaveProperty("success", true);
  });
});
