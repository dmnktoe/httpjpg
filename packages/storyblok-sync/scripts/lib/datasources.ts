import {
  CMS_OPTIONS,
  spacingLabel,
  WORK_TAG_DATASOURCE_SLUG,
  workTagDatasourceEntries,
} from "@httpjpg/storyblok-utils";

import type { Datasource, DatasourceEntry } from "../../src/index";

export interface DatasourceWithEntries {
  datasource: Datasource;
  entries: DatasourceEntry[];
}

function spacingDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Spacing Options", slug: "spacing-options" },
    entries: spacingEntries(CMS_OPTIONS.spacing),
  };
}

function marginDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Margin Options", slug: "margin-options" },
    entries: spacingEntries(CMS_OPTIONS.margin),
  };
}

function colorDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Color Options", slug: "color-options" },
    entries: CMS_OPTIONS.colorEntries.slice(),
  };
}

function workTagsDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Work Tags", slug: WORK_TAG_DATASOURCE_SLUG },
    entries: workTagDatasourceEntries(),
  };
}

export function allDatasources(): DatasourceWithEntries[] {
  return [spacingDs(), marginDs(), colorDs(), workTagsDs()];
}

/** Keeps the scale's own order: `CMS_OPTIONS.margin` lists `0…96` before the negatives. */
function spacingEntries(keys: readonly string[]): DatasourceEntry[] {
  return keys.map((key) => ({ name: spacingLabel(key), value: key }));
}
