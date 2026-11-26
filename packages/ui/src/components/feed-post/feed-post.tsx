"use client";

import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Avatar } from "../avatar/avatar";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { FeedPostActions } from "./feed-post-actions";
import { FeedPostFrame, type FeedPostImage } from "./feed-post-frame";

export type { FeedPostImage };

export interface FeedPostAuthor {
  name: string;
  avatarSrc?: string;
}

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
  /** Who posted it: an avatar and a name above the frame, the name again before the caption. */
  author?: FeedPostAuthor;
  /** Stands in for the frame where a grid squares the post down to a tile and it has no image of its own. */
  cover?: string;
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
  author,
  cover,
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
      data-feed-post=""
      css={{ display: "flex", flexDirection: "column", gap: "2", minW: 0, ...cssProp }}
    >
      {author && (
        <Box data-feed-meta="" css={{ display: "flex", alignItems: "center", gap: "2" }}>
          <Avatar name={author.name} src={author.avatarSrc} />
          <Box as="span" css={{ fontSize: "sm", fontWeight: "bold" }}>
            {author.name}
          </Box>
        </Box>
      )}
      {images.length > 0 ? (
        <Box
          data-feed-media=""
          css={{ position: "relative", display: "flex", flexDirection: "column", gap: "2" }}
        >
          <FeedPostFrame
            images={images}
            ratio={ratio}
            sizes={sizes}
            imageHref={href}
            onImageClick={onImageClick}
          />
          {children ? <FeedPostBadge /> : null}
        </Box>
      ) : href ? (
        <FeedPostTile href={href} cover={cover} />
      ) : null}
      {children ? <Box data-feed-player="">{children}</Box> : null}
      <FeedPostActions />
      {caption && (
        <Box
          as="p"
          data-feed-caption=""
          css={{ m: 0, fontSize: "sm", lineHeight: "snug", whiteSpace: "pre-line" }}
        >
          {author && (
            <>
              <Box as="b" data-feed-meta="">
                {author.name}
              </Box>{" "}
            </>
          )}
          {caption}
        </Box>
      )}
      {dateLabel && (
        <Box data-feed-meta="" css={{ opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
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

function FeedPostBadge() {
  return (
    <Box
      aria-hidden="true"
      data-feed-badge=""
      css={{
        position: "absolute",
        top: "2",
        left: "2",
        display: "none",
        px: "2",
        py: "1",
        color: "white",
        fontFamily: "mono",
        fontSize: "sm",
        lineHeight: 1,
        bg: "rgba(0, 0, 0, 0.55)",
        pointerEvents: "none",
      }}
    >
      ♪
    </Box>
  );
}

function FeedPostTile({ href, cover }: { href: string; cover?: string }) {
  return (
    <Link href={href} aria-label="Open the post" data-feed-tile="" css={TILE_CSS}>
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        "♪ ♫ ♪"
      )}
    </Link>
  );
}

const TILE_CSS = {
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  aspectRatio: "1",
  w: "full",
  color: "pageBg",
  fontFamily: "mono",
  fontSize: "sm",
  textDecoration: "none",
  bg: "pageFg",
  overflow: "hidden",
} as const;
