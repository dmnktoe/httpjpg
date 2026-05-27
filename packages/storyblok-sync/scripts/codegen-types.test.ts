// @vitest-environment node

import type { StoryblokField } from "../src/index";
import {
  blokTypeName,
  fieldToTsType,
  isSpacingField,
  renderInterface,
  toPascal,
} from "./codegen-types";
import type { BlockDef } from "./lib/block";

function field(overrides: Partial<StoryblokField> & { type: string }): StoryblokField {
  return overrides as StoryblokField;
}

describe("toPascal", () => {
  it("converts snake_case to PascalCase", () => {
    expect(toPascal("work_card")).toBe("WorkCard");
    expect(toPascal("music_player")).toBe("MusicPlayer");
    expect(toPascal("grid_item")).toBe("GridItem");
  });

  it("capitalises a single word", () => {
    expect(toPascal("page")).toBe("Page");
    expect(toPascal("button")).toBe("Button");
  });
});

describe("blokTypeName", () => {
  it("produces Sb<Pascal>Data", () => {
    expect(blokTypeName("work_card")).toBe("SbWorkCardData");
    expect(blokTypeName("page")).toBe("SbPageData");
    expect(blokTypeName("footer_config")).toBe("SbFooterConfigData");
  });
});

describe("isSpacingField", () => {
  it("matches base spacing axes", () => {
    for (const axis of ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"]) {
      expect(isSpacingField(axis)).toBe(true);
    }
  });

  it("matches responsive variants", () => {
    expect(isSpacingField("mtMd")).toBe(true);
    expect(isSpacingField("pbLg")).toBe(true);
    expect(isSpacingField("mlMd")).toBe(true);
  });

  it("rejects non-spacing fields", () => {
    expect(isSpacingField("title")).toBe(false);
    expect(isSpacingField("bgColor")).toBe(false);
    expect(isSpacingField("columns")).toBe(false);
  });
});

describe("fieldToTsType", () => {
  it.each([
    ["text", "string"],
    ["textarea", "string"],
    ["markdown", "string"],
    ["datetime", "string"],
  ])("maps %s → %s", (type, expected) => {
    expect(fieldToTsType("x", field({ type }))).toBe(expected);
  });

  it("maps number → number", () => {
    expect(fieldToTsType("speed", field({ type: "number" }))).toBe("number");
  });

  it("maps boolean → boolean", () => {
    expect(fieldToTsType("x", field({ type: "boolean" }))).toBe("boolean");
  });

  it("maps asset → StoryblokImage", () => {
    expect(fieldToTsType("x", field({ type: "asset" }))).toBe("StoryblokImage");
  });

  it("maps multiasset → StoryblokImage[]", () => {
    expect(fieldToTsType("x", field({ type: "multiasset" }))).toBe("StoryblokImage[]");
  });

  it("maps multilink → StoryblokLink", () => {
    expect(fieldToTsType("x", field({ type: "multilink" }))).toBe("StoryblokLink");
  });

  it("maps richtext → StoryblokRichText", () => {
    expect(fieldToTsType("x", field({ type: "richtext" }))).toBe("StoryblokRichText");
  });

  it("maps option with values → literal union", () => {
    const f = field({
      type: "option",
      options: [
        { name: "A", value: "a" },
        { name: "B", value: "b" },
      ],
    });
    expect(fieldToTsType("x", f)).toBe('"a" | "b"');
  });

  it("maps option without values → string", () => {
    expect(fieldToTsType("x", field({ type: "option" }))).toBe("string");
  });

  it("maps options (multi) with values → Array<union>", () => {
    const f = field({
      type: "options",
      options: [
        { name: "X", value: "x" },
        { name: "Y", value: "y" },
      ],
    });
    expect(fieldToTsType("x", f)).toBe('Array<"x" | "y">');
  });

  it("maps bloks with whitelist → typed array union", () => {
    const f = field({
      type: "bloks",
      component_whitelist: ["headline", "paragraph"],
    });
    expect(fieldToTsType("x", f)).toBe("Array<SbHeadlineData | SbParagraphData>");
  });

  it("maps bloks without whitelist → StoryblokBlokData[]", () => {
    expect(fieldToTsType("x", field({ type: "bloks" }))).toBe("StoryblokBlokData[]");
  });

  it("returns null for tab fields", () => {
    expect(fieldToTsType("x", field({ type: "tab" }))).toBeNull();
  });

  it("returns unknown for unrecognised types", () => {
    expect(fieldToTsType("x", field({ type: "custom_thing" }))).toBe("unknown");
  });
});

describe("renderInterface", () => {
  it("renders a basic block with spacing", () => {
    const def: BlockDef = {
      name: "test_block",
      display_name: "Test",
      group: "Content",
      icon: "block-doc",
      color: "#000",
      schema: {
        title: { type: "text", required: true } as StoryblokField,
        count: { type: "number" } as StoryblokField,
        mt: { type: "option" } as StoryblokField,
      },
    };
    const result = renderInterface(def);
    expect(result).toContain(
      "export interface SbTestBlockData extends StoryblokBlokData, BlokSpacing",
    );
    expect(result).toContain('component: "test_block"');
    expect(result).toContain("title: string;");
    expect(result).toContain("count?: number;");
    expect(result).not.toContain("mt");
  });

  it("omits BlokSpacing when no spacing fields exist", () => {
    const def: BlockDef = {
      name: "simple",
      display_name: "Simple",
      group: "Pages",
      icon: "block-doc",
      color: "#000",
      schema: {
        body: { type: "bloks" } as StoryblokField,
      },
    };
    const result = renderInterface(def);
    expect(result).toContain("extends StoryblokBlokData {");
    expect(result).not.toContain("BlokSpacing");
  });

  it("skips tab_ prefixed fields", () => {
    const def: BlockDef = {
      name: "tabbed",
      display_name: "Tabbed",
      group: "Content",
      icon: "block-doc",
      color: "#000",
      schema: {
        tab_layout: { type: "tab" } as StoryblokField,
        title: { type: "text" } as StoryblokField,
      },
    };
    const result = renderInterface(def);
    expect(result).not.toContain("tab_layout");
    expect(result).toContain("title");
  });
});
