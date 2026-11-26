"use client";

import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Link } from "../link/link";
import { FeedPostFrame, type FeedPostImage } from "./feed-post-frame";

export type { FeedPostImage };

export interface FeedPostProps {
  images: FeedPostImage[];
  /** CSS aspect ratio shared by every image of the post, e.g. `4/5`. @default "1/1" */
  ratio?: string;
  caption?: string;
  /** Preformatted date label; `dateTime` is the machine-readable value. */
  date?: string;
  dateTime?: string;
  /** Permalink. The date and every image link to it, and `onImageClick` is ignored. */
  href?: string;
  /** `sizes` hint for every image. */
  sizes?: string;
  /** Makes each image a button, e.g. to open a lightbox. Only without `href`. */
  onImageClick?: (index: number) => void;
  /** Rendered between the frame and the caption: the post's music player. */
  children?: ReactNode;
  css?: SystemStyleObject;
}

export function FeedPost({
  images,
  ratio = "1/1",
  caption,
  date,
  dateTime,
  href,
  sizes = "(min-width: 768px) 33vw, 100vw",
  onImageClick,
  children,
  css: cssProp,
}: FeedPostProps) {
  if (!images.length && !children) {
    return null;
  }

  const dateLabel = date ? (
    <time dateTime={dateTime} title={dateTime}>
      {date}
    </time>
  ) : null;

  return (
    <Box
      as="article"
      css={{ display: "flex", flexDirection: "column", gap: "2", minW: 0, ...cssProp }}
    >
      {images.length > 0 && (
        <FeedPostFrame
          images={images}
          ratio={ratio}
          sizes={sizes}
          imageHref={href}
          onImageClick={onImageClick}
        />
      )}
      {children}
      {caption && (
        <Box
          as="p"
          data-feed-caption=""
          css={{ m: 0, fontSize: "sm", lineHeight: "snug", whiteSpace: "pre-line" }}
        >
          {caption}
        </Box>
      )}
      {dateLabel && (
        <Box css={{ opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
          {href ? (
            <Link href={href} css={{ textDecoration: "none" }}>
              {dateLabel}
            </Link>
          ) : (
            dateLabel
          )}
        </Box>
      )}
    </Box>
  );
}
