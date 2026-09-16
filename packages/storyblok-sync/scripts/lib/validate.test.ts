// @vitest-environment node
import type { BlockDef } from "./block";
import { field } from "./fields";
import { toSchemaLike, validateLocalSchema } from "./validate";

function block(name: string, schema: BlockDef["schema"]): BlockDef {
  return { name, display_name: name, group: "Content", icon: "block-star", color: "#000", schema };
}

describe("validateLocalSchema", () => {
  it("accepts the schema this repo actually pushes", () => {
    expect(validateLocalSchema().ok).toBe(true);
  });

  it("adds an entrance-animation field on layout bloks", () => {
    const schema = toSchemaLike();
    const section = schema.blocks.find((block) => block.name === "section");
    const gridItem = schema.blocks.find((block) => block.name === "grid_item");
    expect(section?.fields.some((field) => field.name === "animation")).toBe(true);
    expect(gridItem?.fields.some((field) => field.name === "animation")).toBe(true);
  });

  it("rejects a bloks whitelist pointing at an unknown block", () => {
    const result = validateLocalSchema([
      block("grid", { items: field.bloks("Items", { whitelist: ["ghost_block"] }) }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("ghost_block"))).toBe(true);
  });

  it("rejects a datasource slug no datasource in this repo provides", () => {
    const result = validateLocalSchema([
      block("spacer", { size: field.datasource("Size", "ghost-options") }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("ghost-options"))).toBe(true);
  });

  it("rejects a duplicate block name", () => {
    const result = validateLocalSchema([
      block("twin", { title: field.text("Title") }),
      block("twin", { title: field.text("Title") }),
    ]);

    expect(result.ok).toBe(false);
  });
});

describe("toSchemaLike", () => {
  it("normalizes the wire schema record into named fields", () => {
    const schema = toSchemaLike([
      block("hero", {
        title: field.text("Title", { required: true }),
        body: field.bloks("Body", { whitelist: ["hero"] }),
      }),
    ]);

    expect(schema.blocks).toEqual([
      {
        name: "hero",
        folder: "Content",
        fields: [
          { name: "title", type: "text", required: true },
          { name: "body", type: "bloks", allow: ["hero"] },
        ],
      },
    ]);
  });
});
