import { contentBlocks } from "../blocks/content";
import { layoutBlocks } from "../blocks/layout";
import { mediaBlocks } from "../blocks/media";
import { pageBlocks } from "../blocks/pages";
import { settingsBlocks } from "../blocks/settings";
import type { BlockDef } from "./block";

export function allBlocks(): BlockDef[] {
  return [...layoutBlocks, ...contentBlocks, ...mediaBlocks, ...pageBlocks, ...settingsBlocks];
}
