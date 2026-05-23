#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StoryblokField } from "../src/index";
import { contentBlocks } from "./blocks/content";
import { layoutBlocks } from "./blocks/layout";
import { mediaBlocks } from "./blocks/media";
import { pageBlocks } from "./blocks/pages";
import { settingsBlocks } from "./blocks/settings";
import type { BlockDef } from "./lib/block";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, "../../storyblok-utils/src/blok-types.gen.ts");

const ALL_BLOCKS: BlockDef[] = [
  ...layoutBlocks,
  ...contentBlocks,
  ...mediaBlocks,
  ...pageBlocks,
  ...settingsBlocks,
];

const SPACING_FIELDS = ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"] as const;

function toPascal(snake: string): string {
  return snake
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function blokTypeName(name: string): string {
  return `Sb${toPascal(name)}Data`;
}

function isSpacingField(key: string): boolean {
  const stripped = key.replace(/(Md|Lg)$/, "");
  return (SPACING_FIELDS as readonly string[]).includes(stripped);
}

function fieldToTsType(name: string, field: StoryblokField): string | null {
  switch (field.type) {
    case "text":
    case "textarea":
    case "markdown":
    case "datetime":
    case "number":
      return "string";
    case "boolean":
      return "boolean";
    case "asset":
      return "StoryblokImage";
    case "multiasset":
      return "StoryblokImage[]";
    case "multilink":
      return "StoryblokLink";
    case "richtext":
      return "StoryblokRichText";
    case "image":
      return "StoryblokImage";
    case "option":
      if (field.options && field.options.length > 0) {
        return field.options.map((o) => JSON.stringify(o.value)).join(" | ");
      }
      return "string";
    case "options":
      if (field.options && field.options.length > 0) {
        return `Array<${field.options.map((o) => JSON.stringify(o.value)).join(" | ")}>`;
      }
      return "string[]";
    case "bloks":
      if (field.component_whitelist && field.component_whitelist.length > 0) {
        const union = field.component_whitelist.map(blokTypeName).join(" | ");
        return `Array<${union}>`;
      }
      return "StoryblokBlokData[]";
    case "tab":
      return null;
    default:
      return "unknown";
  }
}

function renderInterface(def: BlockDef): string {
  const lines: string[] = [];
  const seen = new Set<string>();
  let hasSpacing = false;

  for (const [key, fieldDef] of Object.entries(def.schema)) {
    if (key.startsWith("tab_")) {
      continue;
    }
    if (isSpacingField(key)) {
      hasSpacing = true;
      continue;
    }
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const type = fieldToTsType(key, fieldDef);
    if (type === null) {
      continue;
    }
    const optional = fieldDef.required ? "" : "?";
    lines.push(`  ${key}${optional}: ${type};`);
  }

  const extendsList = ["StoryblokBlokData"];
  if (hasSpacing) {
    extendsList.push("BlokSpacing");
  }
  const heritage = ` extends ${extendsList.join(", ")}`;

  return `export interface ${blokTypeName(def.name)}${heritage} {
  component: ${JSON.stringify(def.name)};
${lines.join("\n")}
}`;
}

function renderHeader(): string {
  return `/* eslint-disable */
// AUTO-GENERATED — run \`pnpm --filter @httpjpg/storyblok-sync codegen\`.

import type {
  StoryblokBlokData,
  StoryblokImage,
  StoryblokLink,
  StoryblokRichText,
} from "./types";

export interface BlokSpacing {
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  pt?: string;
  pb?: string;
  pl?: string;
  pr?: string;
  mtMd?: string;
  mbMd?: string;
  mlMd?: string;
  mrMd?: string;
  ptMd?: string;
  pbMd?: string;
  plMd?: string;
  prMd?: string;
  mtLg?: string;
  mbLg?: string;
  mlLg?: string;
  mrLg?: string;
  ptLg?: string;
  pbLg?: string;
  plLg?: string;
  prLg?: string;
}
`;
}

function renderRegistry(blocks: BlockDef[]): string {
  const entries = blocks.map((b) => `  ${b.name}: ${blokTypeName(b.name)};`).join("\n");
  return `export type SbBlokName =
${blocks.map((b) => `  | ${JSON.stringify(b.name)}`).join("\n")};

export interface SbBlokRegistry {
${entries}
}

export type SbBlok = SbBlokRegistry[SbBlokName];`;
}

async function main() {
  const header = renderHeader();
  const interfaces = ALL_BLOCKS.map(renderInterface).join("\n\n");
  const registry = renderRegistry(ALL_BLOCKS);

  const output = `${header}\n${interfaces}\n\n${registry}\n`;
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, output, "utf8");
  console.log(`✨ wrote ${ALL_BLOCKS.length} blok types to ${OUTPUT}`);
}

main().catch((error) => {
  console.error("❌ Codegen failed:", error);
  process.exit(1);
});
