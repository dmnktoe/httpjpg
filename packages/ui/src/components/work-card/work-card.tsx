"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import type { OverlayPattern } from "../image-overlay/image-overlay";
import { Slideshow, type SlideshowImage } from "../slideshow/slideshow";
import { WorkCardContent } from "./work-card-content";
import { WorkCardTitle } from "./work-card-title";

export type WorkCardVariant = "default" | "compact" | "featured";

export interface WorkCardProps {
  title: string;
  description?: ReactNode;
  date?: string | Date;
  dateEnd?: string | Date;
  images: SlideshowImage[];
  slug: string;
  baseUrl?: string;
  variant?: WorkCardVariant;
  /** Marks the card's first slide as the LCP image. */
  priority?: boolean;
  sizes?: string;
  /** Rendered as inline chips and surfaced as `data-tags` for `<WorkTagFilter>`. */
  tags?: string[];
  /** ASCII sparkle overlay on each slide. @default "random" */
  overlay?: OverlayPattern;
  /** Pushes the overlay particles inward over the image. @default 6 */
  overlayInset?: number;
  css?: SystemStyleObject;
}

export const WorkCard = forwardRef<HTMLDivElement, WorkCardProps>(
  (
    {
      title,
      description,
      date,
      dateEnd,
      images,
      slug,
      baseUrl = "/work",
      variant = "default",
      priority = false,
      sizes,
      tags,
      overlay = "random",
      overlayInset = 6,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const showDescription = variant !== "compact";
    const tagAttr = tags?.length ? `,${tags.join(",")},` : undefined;
    return (
      <Box
        ref={ref}
        data-tags={tagAttr}
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "2",
          w: "full",
          containerType: "inline-size",
          // Backdrop for the title's `mixBlendMode` — it blends against this group, so
          // the group has to be isolated and opaque, otherwise the headline blends
          // against transparency and renders plain white.
          isolation: "isolate",
          bg: "pageBg",
          ...cssProp,
        }}
        {...props}
      >
        {/* `isolation` rather than a `zIndex`, on this box only. It still caps the
            slide overlay and copyright label so they cannot paint over the title, but
            it keeps the box in the in-flow paint order — a flex item with a z-index
            forms a stacking context even while static, and one around the title would
            trap its blend in an empty group. */}
        <Box css={{ overflow: "visible", isolation: "isolate" }}>
          <Slideshow
            speed={0}
            animation="sharpen"
            images={images}
            priority={priority}
            sizes={sizes}
            overlay={overlay}
            overlayInset={overlayInset}
          />
        </Box>

        <Box>
          <Box
            css={{
              display: "flex",
              flexDirection: { base: "column", md: "row" },
              gap: "2",
            }}
          >
            <WorkCardTitle title={title} variant={variant} />
            <WorkCardContent
              description={showDescription ? description : undefined}
              date={date}
              dateEnd={dateEnd}
              slug={slug}
              baseUrl={baseUrl}
              tags={tags}
            />
          </Box>
        </Box>
      </Box>
    );
  },
);

WorkCard.displayName = "WorkCard";
