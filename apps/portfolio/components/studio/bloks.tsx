"use client";

import { Headline, Paragraph } from "@httpjpg/ui";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "assetUrl";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
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

const TEXT_ALIGN_OPTIONS = [
  { value: "", label: "—" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const BUTTON_VARIANTS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "disabled", label: "Disabled" },
];

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

const VIDEO_SOURCES = [
  { value: "native", label: "Native" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
];

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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        border: "1px dashed",
        borderColor: "pageBorder",
        opacity: 0.6,
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
            fontFamily: "mono",
            fontSize: "sm",
            opacity: 0.7,
            textAlign: "center",
            wordBreak: "break-all",
            px: 2,
          })}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function ButtonPreview({ text, variant, size }: { text: string; variant?: string; size?: string }) {
  const pad = size === "lg" ? "12px 24px" : size === "sm" ? "4px 12px" : "8px 16px";
  const isOutline = variant === "outline";
  const isSecondary = variant === "secondary";
  const isDisabled = variant === "disabled";
  return (
    <span
      className={css({
        display: "inline-block",
        fontFamily: "headline",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "wide",
        bg: isOutline ? "transparent" : isSecondary ? "pageBg" : "pageFg",
        color: isOutline || isSecondary ? "pageFg" : "pageBg",
        border: "2px solid",
        borderColor: "pageFg",
        opacity: isDisabled ? 0.4 : 1,
      })}
      style={{ padding: pad }}
    >
      {text}
    </span>
  );
}

function MarqueePreview({ text }: { text: string }) {
  return (
    <div
      className={css({
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "headline",
        fontSize: "xl",
        textTransform: "uppercase",
      })}
    >
      <span className={css({ whiteSpace: "nowrap", px: 2 })}>« {text} »</span>
    </div>
  );
}

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
    <ButtonPreview
      text={str(d.text, "Button")}
      variant={d.variant as string}
      size={d.size as string}
    />
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
      <img
        src={str(d.imageUrl)}
        alt={str(d.alt)}
        className={css({ width: "100%", height: "100%", objectFit: "cover" })}
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
      <Placeholder label={`VIDEO · ${str(d.source)}`} sub={str(d.videoUrl)} />
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
  preview: (d) => <MarqueePreview text={str(d.text)} />,
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
  preview: (d) => <Placeholder label="MUSIC PLAYER" sub={str(d.spotifyUrl)} />,
};

const workCard: BlokPlugin = {
  type: "work_card",
  label: "Work Card",
  group: "Widgets",
  defaultSize: { w: 4, h: 5 },
  defaults: { workUuid: "" },
  fields: [{ key: "workUuid", label: "Work Story UUID", type: "text" }],
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
