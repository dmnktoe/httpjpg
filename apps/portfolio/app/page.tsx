import { fetchStory } from "@httpjpg/storyblok-next";
import { STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokLive } from "@/components/providers/storyblok-live";
import { ThemeSync } from "@/components/ui/theme-sync";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = await searchParams;
  const { isEnabled } = await draftMode();

  const isVisualEditor = search._storyblok || search._draft;
  const isDraft = Boolean(isEnabled || isVisualEditor);

  const story = await fetchStory(STORYBLOK_SLUGS.HOME, {
    draftMode: isDraft,
    resolveRelations: [STORYBLOK_RELATIONS.WORK_LIST],
  });

  if (!story) {
    return notFound();
  }

  if (isDraft) {
    return <StoryblokLive story={story} />;
  }

  const pageTheme = story.content?.isDark ? "dark" : "light";

  return (
    <>
      <ThemeSync theme={pageTheme} />
      <StoryblokServerComponent blok={story.content} />
    </>
  );
}

export const revalidate = 3600;
