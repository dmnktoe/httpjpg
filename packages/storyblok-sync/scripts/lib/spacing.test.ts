// @vitest-environment node
import { field } from "./fields";
import { withSpacing } from "./spacing";

describe("withSpacing", () => {
  it("appends the 24-field spacing matrix and a Spacing tab", () => {
    const schema = withSpacing({ title: field.text("Title") });
    expect(schema.title).toMatchObject({ type: "text" });
    expect(schema.tab_spacing).toMatchObject({ type: "tab" });
    expect(schema.mt).toMatchObject({ type: "option" });
    expect(schema.prLg).toMatchObject({ type: "option" });
    expect(Object.keys(schema).filter((k) => /^(m|p)[tblr](Md|Lg)?$/.test(k))).toHaveLength(24);
  });
});
