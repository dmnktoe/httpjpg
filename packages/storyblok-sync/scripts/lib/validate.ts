import { type SchemaFieldLike, type SchemaLike, validateSchema } from "@storyblok/schema";

import type { StoryblokField } from "../../src/index";
import type { BlockDef } from "./block";
import { allDatasources } from "./datasources";
import { allBlocks } from "./schema";

function toSchemaField(name: string, field: StoryblokField): SchemaFieldLike {
  return {
    name,
    type: field.type,
    ...("required" in field && field.required !== undefined && { required: field.required }),
    ...("component_whitelist" in field &&
      field.component_whitelist && { allow: field.component_whitelist }),
    ...("datasource_slug" in field &&
      field.datasource_slug && { datasource: field.datasource_slug }),
    ...("source" in field && field.source && { source: field.source }),
    ...("options" in field && field.options && { options: field.options }),
    ...("field_type" in field && field.field_type && { field_type: field.field_type }),
  };
}

function toSchemaBlock(def: BlockDef) {
  return {
    name: def.name,
    folder: def.group,
    fields: Object.entries(def.schema).map(([name, field]) => toSchemaField(name, field)),
  };
}

export function toSchemaLike(
  blocks: BlockDef[] = allBlocks(),
  datasources = allDatasources(),
): SchemaLike {
  return {
    blocks: blocks.map(toSchemaBlock),
    datasources: datasources.map(({ datasource }) => ({
      name: datasource.name,
      slug: datasource.slug,
    })),
  };
}

export function validateLocalSchema(blocks?: BlockDef[]) {
  return validateSchema(toSchemaLike(blocks));
}
