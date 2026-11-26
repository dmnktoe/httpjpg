"use client";

import {
  assetAspectRatio,
  assetDimensions,
  getResponsiveImage,
  imagePreset,
  type SbPostData,
  type SbPostImageData,
} from "@httpjpg/storyblok-utils";
import {
  Box,
  FeedPost,
  type FeedPostImage,
  Lightbox,
  type LightboxEntry,
  useClientNow,
  useLightbox,
  useLightboxEntry,
  useLightboxGallery,
} from "@httpjpg/ui";
import { memo, type MouseEvent } from "react";

import { editableAttrs } from "../../lib/use-blok";
import { SbMusicPlayer } from "../music-player/SbMusicPlayer";
import { parsePostDate, postDay, relativePostDate, rememberFeedOrigin } from "./lib";

export interface SbPostProps {
  blok: SbPostData;
  /** Permalink of the post's story. With it the images and the date open the post, without it an image opens the lightbox. */
  href?: string;
  /** `sizes` hint for the images. Defaults to the feed grid's columns. */
  sizes?: string;
}

export const SbPost = memo(function SbPost({ blok, href, sizes }: SbPostProps) {
  const gallery = useLightboxGallery();
  const viewer = useLightbox();
  const images = (blok.images ?? []).filter((item) => Boolean(item.image?.filename));
  const entries = href ? [] : images.map((item) => toLightboxEntry(item, blok.caption));
  const music = blok.music?.[0];
  const relativeDate = useRelativeDate(blok.date);

  if (!images.length && !music?.src) {
    return null;
  }

  const handleImageClick = (index: number) => {
    const entry = entries[index];
    if (gallery && entry) {
      gallery.openAt(entry.id);
      return;
    }
    viewer.openAt(index);
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest("a[href]")) {
      rememberFeedOrigin();
    }
  };

  return (
    <Box {...editableAttrs(blok)} onClickCapture={href ? handleClickCapture : undefined}>
      <FeedPost
        images={images.map(toFeedImage)}
        ratio={postRatio(blok, images)}
        caption={blok.caption?.trim() || undefined}
        date={relativeDate ?? postDay(blok.date)}
        dateTime={postDay(blok.date)}
        href={href}
        sizes={sizes}
        onImageClick={handleImageClick}
      >
        {music?.src ? <SbMusicPlayer blok={music} /> : null}
      </FeedPost>
      {entries.map((entry) => (
        <PostLightboxEntry key={entry.id} entry={entry} />
      ))}
      {!gallery && entries.length > 0 && (
        <Lightbox
          open={viewer.open}
          items={entries}
          index={viewer.index}
          onClose={viewer.close}
          onIndexChange={viewer.setIndex}
        />
      )}
    </Box>
  );
});

SbPost.displayName = "SbPost";

function PostLightboxEntry({ entry }: { entry: LightboxEntry }) {
  useLightboxEntry(entry);
  return null;
}

const TILE_WIDTHS = [640, 960, 1280, 1920];

function toFeedImage(item: SbPostImageData): FeedPostImage {
  const { src, srcSet } = getResponsiveImage(item.image.filename, {
    widths: TILE_WIDTHS,
    focus: item.image.focus || "",
  });
  return {
    id: item._uid,
    src,
    srcSet: srcSet || undefined,
    alt: imageAlt(item),
    fit: item.fit === "contain" ? "contain" : "cover",
  };
}

function toLightboxEntry(item: SbPostImageData, caption: string | undefined): LightboxEntry {
  return {
    id: item._uid,
    src: imagePreset.full(item.image.filename, item.image.focus),
    placeholder: toFeedImage(item).src,
    ...assetDimensions(item.image),
    alt: imageAlt(item),
    caption: caption?.trim() || undefined,
    copyright: item.image.copyright || undefined,
    copyrightSource: item.image.source || undefined,
  };
}

function imageAlt(item: SbPostImageData): string {
  return item.alt || item.image.alt || item.image.title || "";
}

function postRatio(blok: SbPostData, images: SbPostImageData[]): string {
  if (blok.format === "original") {
    return assetAspectRatio(images[0]?.image) ?? "1/1";
  }
  return blok.format || "1/1";
}

function useRelativeDate(date: string | undefined): string | null {
  const now = useClientNow();
  const parsed = now ? parsePostDate(date) : null;
  return parsed ? relativePostDate(parsed, now) : null;
}
