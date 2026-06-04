import type { BlockDef } from "../lib/block";
import { contentBlocks } from "./content";
import { layoutBlocks } from "./layout";
import { mediaBlocks } from "./media";
import { pageBlocks } from "./pages";
import { settingsBlocks } from "./settings";

const ALL_BLOCKS: BlockDef[] = [
  ...layoutBlocks,
  ...contentBlocks,
  ...mediaBlocks,
  ...pageBlocks,
  ...settingsBlocks,
];

describe("blok editor previews", () => {
  for (const block of ALL_BLOCKS) {
    const previewField = block.preview_field;
    if (previewField) {
      it(`${block.name}: preview_field "${previewField}" maps to a schema field`, () => {
        expect(Object.keys(block.schema)).toContain(previewField);
      });
    }

    const previewTmpl = block.preview_tmpl;
    if (previewTmpl) {
      it(`${block.name}: preview_tmpl placeholders map to schema fields`, () => {
        const keys = Object.keys(block.schema);
        const placeholders = [...previewTmpl.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
        expect(placeholders.length).toBeGreaterThan(0);
        for (const placeholder of placeholders) {
          expect(keys).toContain(placeholder);
        }
      });
    }
  }
});
