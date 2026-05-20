import { env } from "@httpjpg/env";

import { GridBuilder } from "@/components/studio/grid-builder";

export default function GridStudioPage() {
  const pushEnabled = Boolean(env.STORYBLOK_MANAGEMENT_TOKEN && env.STORYBLOK_SPACE_ID);
  return <GridBuilder pushEnabled={pushEnabled} siteUrl={env.NEXT_PUBLIC_APP_URL} />;
}
