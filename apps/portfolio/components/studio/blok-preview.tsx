"use client";

import { Headline, Paragraph } from "@httpjpg/ui";
import { css } from "styled-system/css";

import type { BuilderItem } from "./lib";

interface BlokPreviewProps {
  item: BuilderItem;
}

export function BlokPreview({ item }: BlokPreviewProps) {
  const node = renderBlok(item);
  return (
    <div
      className={css({
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      })}
    >
      {node}
    </div>
  );
}

function renderBlok(item: BuilderItem) {
  const data = item.data;
  switch (item.type) {
    case "headline": {
      const level = clampLevel(data.level);
      const align = (data.align as string) || undefined;
      return (
        <Headline level={level} css={align ? { textAlign: align as "left" } : undefined}>
          {String(data.text ?? "Headline")}
        </Headline>
      );
    }
    case "paragraph": {
      const align = (data.align as string) || "left";
      return (
        <Paragraph align={align as "left" | "center" | "right"}>
          {String(data.text ?? "")}
        </Paragraph>
      );
    }
    case "richtext":
      return (
        <p className={css({ fontFamily: "sans", fontSize: "base", whiteSpace: "pre-wrap" })}>
          {String(data.content ?? "")}
        </p>
      );
    case "button":
      return (
        <ButtonPreview
          text={String(data.text ?? "Button")}
          variant={data.variant as string}
          size={data.size as string}
        />
      );
    case "image":
      return data.imageUrl ? (
        <img
          src={String(data.imageUrl)}
          alt={String(data.alt ?? "")}
          className={css({ width: "100%", height: "100%", objectFit: "cover" })}
        />
      ) : (
        <Placeholder label="IMAGE" />
      );
    case "video":
      return data.videoUrl ? (
        <Placeholder label={`VIDEO · ${String(data.source ?? "")}`} sub={String(data.videoUrl)} />
      ) : (
        <Placeholder label="VIDEO" />
      );
    case "marquee":
      return <MarqueePreview text={String(data.text ?? "")} />;
    case "music_player":
      return <Placeholder label="MUSIC PLAYER" sub={String(data.spotifyUrl ?? "")} />;
    case "work_card":
      return <Placeholder label="WORK CARD" sub={String(data.workUuid ?? "")} />;
    case "work_list":
      return <Placeholder label="WORK LIST" sub="(resolved at runtime)" />;
    case "slideshow":
      return <Placeholder label="SLIDESHOW" sub="(configure slides in CMS)" />;
    default:
      return <Placeholder label={item.type} />;
  }
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
