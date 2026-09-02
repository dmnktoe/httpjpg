// @vitest-environment node
import { field, labelize, tabbed } from "./fields";

describe("field helpers", () => {
  it("builds the primitive field types editors use", () => {
    expect(field.text("Title")).toMatchObject({ type: "text", display_name: "Title" });
    expect(field.textarea("Body")).toMatchObject({ type: "textarea" });
    expect(field.number("Count")).toMatchObject({ type: "number" });
    expect(field.boolean("On", "true")).toMatchObject({ type: "boolean", default_value: "true" });
    expect(field.datetime("When")).toMatchObject({ type: "datetime" });
    expect(field.asset("Image", ["images"])).toMatchObject({
      type: "asset",
      filetypes: ["images"],
    });
    expect(field.multiasset("Gallery", ["images"])).toMatchObject({ type: "multiasset" });
    expect(field.multilink("Link")).toMatchObject({ type: "multilink" });
    expect(field.richtext("Copy")).toMatchObject({ type: "richtext" });
    expect(
      field.bloks("Items", { required: true, whitelist: ["headline"], maximum: 3 }),
    ).toMatchObject({
      type: "bloks",
      required: true,
      restrict_components: true,
      component_whitelist: ["headline"],
      maximum: 3,
    });
    expect(field.bloks("Loose")).toMatchObject({ type: "bloks" });
    expect(field.stories("Work", "work/")).toMatchObject({
      type: "options",
      source: "internal_stories",
      folder_slug: "work/",
    });
    expect(field.datasource("Color", "color-options")).toMatchObject({
      type: "option",
      source: "internal",
      datasource_slug: "color-options",
    });
    expect(field.datasourceMulti("Tags", "work-tags")).toMatchObject({ type: "options" });
    expect(field.options("Align", ["left", { name: "Right", value: "right" }]).options).toEqual([
      { name: "left", value: "left" },
      { name: "Right", value: "right" },
    ]);
    expect(field.tab("Spacing", ["mt", "mb"])).toMatchObject({ type: "tab", keys: ["mt", "mb"] });
  });
});

describe("tabbed / labelize", () => {
  it("wraps fields in a tab and title-cases enum values", () => {
    const grouped = tabbed("Layout", "layout", { gap: field.text("Gap") });
    expect(grouped.tab_layout).toMatchObject({ type: "tab", keys: ["gap"] });
    expect(grouped.gap).toMatchObject({ type: "text" });
    expect(labelize(["space-between", "start"])).toEqual([
      { name: "Space Between", value: "space-between" },
      { name: "Start", value: "start" },
    ]);
  });
});
