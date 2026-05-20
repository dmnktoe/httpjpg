import { type StoryblokImage, toSlideshowImage } from "@httpjpg/storyblok-utils";
import { type OverlayPattern, WorkCard, type WorkCardProps } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbWorkCardProps {
  blok: BlokSpacing & {
    _uid: string;
    title: string;
    description?: string;
    date?: string;
    date_end?: string;
    slug: string;
    images: StoryblokImage[];
    baseUrl?: string;
    variant?: WorkCardProps["variant"];
    priority?: boolean;
    tags?: string;
    overlay?: OverlayPattern;
    overlayInset?: number;
  };
}

export const SbWorkCard = memo(function SbWorkCard({ blok }: SbWorkCardProps) {
  const {
    title,
    description,
    date,
    date_end,
    slug,
    images,
    baseUrl = "/work",
    variant,
    priority,
    tags,
    overlay = "random",
    overlayInset,
  } = blok;
  const tagList = tags
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!images?.length) {
    return null;
  }

  return (
    <WorkCard
      {...editableAttrs(blok)}
      title={title}
      description={description}
      date={date}
      dateEnd={date_end}
      slug={slug}
      baseUrl={baseUrl}
      variant={variant}
      priority={priority}
      tags={tagList}
      images={images.map((img) => toSlideshowImage(img, title))}
      overlay={overlay}
      overlayInset={overlayInset}
      css={spacingCss(blok)}
    />
  );
});

SbWorkCard.displayName = "SbWorkCard";
