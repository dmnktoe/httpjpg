import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { spacing } from "@httpjpg/tokens";

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
        name: `${key} (${spacing[key as unknown as keyof typeof spacing]})`,
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

export function allDatasources(): DatasourceWithEntries[] {
  return [spacingDs(), colorDs()];
}
