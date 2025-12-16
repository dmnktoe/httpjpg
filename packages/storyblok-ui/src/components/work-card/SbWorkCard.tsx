"use client";

import { WorkCard } from "@httpjpg/ui";
import { memo } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokImage } from "../../types";

export interface SbWorkCardProps {
  blok: {
    _uid: string;
    title: string;
    description?: string;
    date?: string;
    slug: string;
    images: StoryblokImage[];
    baseUrl?: string;
  };
}

/**
 * Storyblok WorkCard Component
 * Portfolio work showcase card with slideshow
 */
export const SbWorkCard = memo(function SbWorkCard({ blok }: SbWorkCardProps) {
  const { title, description, date, slug, images, baseUrl = "/work" } = blok;
  const editableProps = useStoryblokEditable(blok);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <WorkCard
      {...editableProps}
      title={title}
      description={description}
      date={date}
      slug={slug}
      baseUrl={baseUrl}
      images={images.map((img) => {
        // Check content_type first (for Storyblok assets)
        const hasVideoContentType = img.content_type?.startsWith("video/");
        // Fallback: Check file extension (for external URLs)
        const hasVideoExtension = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(
          img.filename || "",
        );
        const isVideo = hasVideoContentType || hasVideoExtension;

        return {
          url: isVideo ? "" : img.filename,
          alt: img.alt || img.title || title,
          copyright: img.copyright,
          focus: img.focus,
          videoUrl: isVideo ? img.filename : undefined,
        };
      })}
    />
  );
});
