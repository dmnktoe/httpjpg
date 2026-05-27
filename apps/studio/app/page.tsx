import { GridBuilder } from "@/components/grid-builder";

export default function GridStudioPage() {
  const pushEnabled = Boolean(
    process.env.STORYBLOK_MANAGEMENT_TOKEN && process.env.STORYBLOK_SPACE_ID,
  );
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return <GridBuilder pushEnabled={pushEnabled} siteUrl={siteUrl} />;
}
