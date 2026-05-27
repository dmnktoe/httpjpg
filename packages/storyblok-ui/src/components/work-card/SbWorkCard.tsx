import { type SbWorkCardData, toSlideshowImage } from "@httpjpg/storyblok-utils";
import { WorkCard } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbWorkCardProps {
  blok: SbWorkCardData;
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
