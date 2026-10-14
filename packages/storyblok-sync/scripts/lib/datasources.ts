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
    entries: CMS_OPTIONS.spacing
      .slice()
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        name: spacingLabel(key),
        value: key,
      })),
  };
}

function marginDs(): DatasourceWithEntries {
  return {
    datasource: { name: "Margin Options", slug: "margin-options" },
    entries: CMS_OPTIONS.margin
      .slice()
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        name: spacingLabel(key),
        value: key,
      })),
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
