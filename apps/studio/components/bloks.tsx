"use client";

import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import { Button, Headline, Image, Marquee, MusicPlayer, Paragraph, Video } from "@httpjpg/ui";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "assetUrl"
  | "storyUuid";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  /** For storyUuid: scope picker to stories under this prefix. */
  storyStartsWith?: string;
}

function labelOption<T extends string>(v: T): { value: T; label: string } {
  return { value: v, label: v.charAt(0).toUpperCase() + v.slice(1) };
}

export interface BlokPlugin {
  type: string;
  label: string;
  group: string;
  defaultSize: { w: number; h: number };
  defaults: Record<string, unknown>;
  fields: FieldDef[];
  serialize(data: Record<string, unknown>): Record<string, unknown>;
  deserialize(blok: Record<string, unknown>): Record<string, unknown>;
  preview(data: Record<string, unknown>): ReactNode;
}

const TEXT_ALIGN_OPTIONS = [{ value: "", label: "—" }, ...CMS_OPTIONS.textAlign.map(labelOption)];

const BUTTON_VARIANTS = (["primary", "secondary"] as const).map(labelOption);
const BUTTON_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const HEADLINE_LEVELS = [
  { value: "1", label: "H1" },
  { value: "2", label: "H2" },
  { value: "3", label: "H3" },
];

const VIDEO_SOURCES = (["native", "youtube", "vimeo"] as const).map(labelOption);

function str(v: unknown, fallback = ""): string {
  return v == null ? fallback : String(v);
}

function clampLevel(raw: unknown): 1 | 2 | 3 {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return 2;
}

function Placeholder({ label, sub }: { label: string; sub?: string }) {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        width: "100%",
        height: "100%",
        opacity: 0.6,
        border: "1px dashed",
        borderColor: "pageBorder",
      })}
    >
      <span
        className={css({
          fontFamily: "mono",
          fontSize: "sm",
          fontWeight: "bold",
          letterSpacing: "wide",
        })}
      >
        {label}
      </span>
      {sub && (
        <span
          className={css({
            px: 2,
            opacity: 0.7,
            fontFamily: "mono",
            fontSize: "sm",
            textAlign: "center",
            wordBreak: "break-all",
          })}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";
type VideoSource = "native" | "youtube" | "vimeo";
type MusicSource = "mp3" | "spotify" | "soundcloud";

const headline: BlokPlugin = {
  type: "headline",
  label: "Headline",
  group: "Content",
  defaultSize: { w: 12, h: 2 },
  defaults: { text: "Headline", level: "2" },
  fields: [
    { key: "text", label: "Text", type: "text" },
    { key: "level", label: "Level", type: "select", options: HEADLINE_LEVELS },
    { key: "align", label: "Align", type: "select", options: TEXT_ALIGN_OPTIONS },
  ],
  serialize: (d) => ({
    text: str(d.text),
    level: str(d.level, "2"),
    align: str(d.align),
  }),
  deserialize: (b) => ({
    text: str(b.text, "Headline"),
    level: str(b.level, "2"),
    align: str(b.align),
  }),
  preview: (d) => (
    <Headline
      level={clampLevel(d.level)}
      css={d.align ? { textAlign: d.align as "left" } : undefined}
    >
      {str(d.text, "Headline")}
    </Headline>
  ),
};

const paragraph: BlokPlugin = {
  type: "paragraph",
  label: "Paragraph",
  group: "Content",
  defaultSize: { w: 6, h: 3 },
  defaults: { text: "Lorem ipsum dolor sit amet." },
  fields: [
    { key: "text", label: "Text", type: "textarea" },
    { key: "align", label: "Align", type: "select", options: TEXT_ALIGN_OPTIONS },
  ],
  serialize: (d) => ({ text: str(d.text), align: str(d.align) }),
  deserialize: (b) => ({ text: str(b.text), align: str(b.align) }),
  preview: (d) => (
    <Paragraph align={((d.align as string) || "left") as "left" | "center" | "right"}>
      {str(d.text)}
    </Paragraph>
  ),
};

const button: BlokPlugin = {
  type: "button",
  label: "Button",
  group: "Content",
  defaultSize: { w: 3, h: 2 },
  defaults: { text: "Click", variant: "primary", size: "md", type: "button" },
  fields: [
    { key: "text", label: "Text", type: "text" },
    { key: "variant", label: "Variant", type: "select", options: BUTTON_VARIANTS },
    { key: "size", label: "Size", type: "select", options: BUTTON_SIZES },
    { key: "linkUrl", label: "Link URL", type: "text" },
  ],
  serialize: (d) => ({
    text: str(d.text),
    variant: str(d.variant, "primary"),
    size: str(d.size, "md"),
    type: str(d.type, "button"),
    link: d.linkUrl ? { url: str(d.linkUrl), linktype: "url" } : { linktype: "url" },
  }),
  deserialize: (b) => {
    const link = (b.link as { url?: string } | undefined) ?? {};
    return {
      text: str(b.text, "Click"),
      variant: str(b.variant, "primary"),
      size: str(b.size, "md"),
      type: str(b.type, "button"),
      linkUrl: str(link.url),
    };
  },
  preview: (d) => (
    <Button
      variant={(str(d.variant, "primary") as ButtonVariant) || "primary"}
      size={(str(d.size, "md") as ButtonSize) || "md"}
      type="button"
      tabIndex={-1}
    >
      {str(d.text, "Button")}
    </Button>
  ),
};

const richtext: BlokPlugin = {
  type: "richtext",
  label: "Rich Text",
  group: "Content",
  defaultSize: { w: 8, h: 4 },
  defaults: { content: "" },
  fields: [{ key: "content", label: "Plain text (wrapped as richtext)", type: "textarea" }],
  serialize: (d) => ({
    content: {
      type: "doc",
      content: d.content
        ? [{ type: "paragraph", content: [{ type: "text", text: str(d.content) }] }]
        : [],
    },
  }),
  deserialize: (b) => {
    const doc = b.content as
      | { content?: Array<{ content?: Array<{ text?: string }> }> }
      | undefined;
    const text = doc?.content?.[0]?.content?.[0]?.text ?? "";
    return { content: text };
  },
  preview: (d) => (
    <p className={css({ fontFamily: "sans", fontSize: "base", whiteSpace: "pre-wrap" })}>
      {str(d.content)}
    </p>
  ),
};

const image: BlokPlugin = {
  type: "image",
  label: "Image",
  group: "Media",
  defaultSize: { w: 6, h: 4 },
  defaults: { imageUrl: "", alt: "" },
  fields: [
    { key: "imageUrl", label: "Image URL", type: "assetUrl" },
    { key: "alt", label: "Alt Text", type: "text" },
  ],
  serialize: (d) => ({
    image: d.imageUrl ? { filename: str(d.imageUrl), alt: str(d.alt) } : null,
    alt: str(d.alt),
  }),
  deserialize: (b) => {
    const img = b.image as { filename?: string; alt?: string } | null | undefined;
    return { imageUrl: str(img?.filename), alt: str(img?.alt ?? b.alt) };
  },
  preview: (d) =>
    d.imageUrl ? (
      <Image
        src={str(d.imageUrl)}
        alt={str(d.alt)}
        objectFit="cover"
        css={{ width: "100%", height: "100%" }}
      />
    ) : (
      <Placeholder label="IMAGE" />
    ),
};

const video: BlokPlugin = {
  type: "video",
  label: "Video",
  group: "Media",
  defaultSize: { w: 8, h: 5 },
  defaults: { videoUrl: "", source: "youtube" },
  fields: [
    { key: "videoUrl", label: "Video URL", type: "text" },
    { key: "source", label: "Source", type: "select", options: VIDEO_SOURCES },
  ],
  serialize: (d) => ({ videoUrl: str(d.videoUrl), source: str(d.source, "native") }),
  deserialize: (b) => ({ videoUrl: str(b.videoUrl), source: str(b.source, "native") }),
  preview: (d) =>
    d.videoUrl ? (
      <Video
        src={str(d.videoUrl)}
        source={(str(d.source, "native") as VideoSource) || "native"}
        controls={false}
        autoPlay={false}
        muted
        css={{ width: "100%", height: "100%" }}
      />
    ) : (
      <Placeholder label="VIDEO" />
    ),
};

const slideshow: BlokPlugin = {
  type: "slideshow",
  label: "Slideshow",
  group: "Media",
  defaultSize: { w: 12, h: 6 },
  defaults: {},
  fields: [],
  serialize: () => ({}),
  deserialize: () => ({}),
  preview: () => <Placeholder label="SLIDESHOW" sub="(configure slides in CMS)" />,
};

const marquee: BlokPlugin = {
  type: "marquee",
  label: "Marquee",
  group: "Media",
  defaultSize: { w: 12, h: 2 },
  defaults: { text: "Scrolling text" },
  fields: [{ key: "text", label: "Text", type: "text" }],
  serialize: (d) => ({ text: str(d.text) }),
  deserialize: (b) => ({ text: str(b.text) }),
  preview: (d) => (
    <Marquee pauseOnHover>
      <span
        className={css({
          px: 4,
          fontFamily: "headline",
          fontSize: "xl",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        })}
      >
        {str(d.text)}
      </span>
    </Marquee>
  ),
};

const musicPlayer: BlokPlugin = {
  type: "music_player",
  label: "Music Player",
  group: "Widgets",
  defaultSize: { w: 6, h: 4 },
  defaults: { spotifyUrl: "" },
  fields: [{ key: "spotifyUrl", label: "Spotify URL / ID", type: "text" }],
  serialize: (d) => ({ spotifyUrl: str(d.spotifyUrl) }),
  deserialize: (b) => ({ spotifyUrl: str(b.spotifyUrl) }),
  preview: (d) =>
    d.spotifyUrl ? (
      <MusicPlayer
        source={"spotify" as MusicSource}
        src={str(d.spotifyUrl)}
        showInfo={false}
        showArtwork={false}
      />
    ) : (
      <Placeholder label="MUSIC PLAYER" />
    ),
};

const workCard: BlokPlugin = {
  type: "work_card",
  label: "Work Card",
  group: "Widgets",
  defaultSize: { w: 4, h: 5 },
  defaults: { workUuid: "" },
  fields: [{ key: "workUuid", label: "Work Story", type: "storyUuid", storyStartsWith: "work/" }],
  serialize: (d) => ({ work: str(d.workUuid) }),
  deserialize: (b) => ({ workUuid: str(b.work) }),
  preview: (d) => <Placeholder label="WORK CARD" sub={str(d.workUuid)} />,
};

const workList: BlokPlugin = {
  type: "work_list",
  label: "Work List",
  group: "Widgets",
  defaultSize: { w: 12, h: 6 },
  defaults: {},
  fields: [],
  serialize: () => ({}),
  deserialize: () => ({}),
  preview: () => <Placeholder label="WORK LIST" sub="(resolved at runtime)" />,
};

export const BLOK_REGISTRY: BlokPlugin[] = [
  headline,
  paragraph,
  button,
  richtext,
  image,
  video,
  slideshow,
  marquee,
  musicPlayer,
  workCard,
  workList,
];

export function blokPlugin(type: string): BlokPlugin | undefined {
  return BLOK_REGISTRY.find((p) => p.type === type);
}
