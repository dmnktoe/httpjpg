"use client";

import type { SystemStyleObject } from "styled-system/types";

import { isExternalLink } from "../../lib/is-external-link";
import { Box } from "../box/box";

const SAFE_SCHEMES = ["http", "https", "mailto", "tel"];

function isSafeHref(href: string): boolean {
  const cleaned = Array.from(href)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 0x20 && code !== 0x7f;
    })
    .join("");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned);
  return !scheme || SAFE_SCHEMES.includes(scheme[1].toLowerCase());
}

/** Classic forum userbar canvas. Images keep this size and stay unsmoothed. */
export const USERBAR_WIDTH = 350;
export const USERBAR_HEIGHT = 19;

export interface UserbarItem {
  src: string;
  alt: string;
  href?: string;
}

export interface UserbarsProps {
  items: UserbarItem[];
  css?: SystemStyleObject;
}

export function Userbars({ items, css: cssProp }: UserbarsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      as="ul"
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
        m: 0,
        p: 0,
        listStyle: "none",
        w: "full",
        ...cssProp,
      }}
    >
      {items.map((item, index) => (
        <Box as="li" key={`${item.src}-${index}`}>
          <UserbarImage {...item} />
        </Box>
      ))}
    </Box>
  );
}

function UserbarImage({ src, alt, href }: UserbarItem) {
  const image = (
    <Box
      as="img"
      src={src}
      alt={alt}
      width={USERBAR_WIDTH}
      height={USERBAR_HEIGHT}
      loading="lazy"
      css={{
        display: "block",
        objectFit: "contain",
      }}
      style={{
        width: `${USERBAR_WIDTH}px`,
        height: `${USERBAR_HEIGHT}px`,
        maxWidth: "100%",
        imageRendering: "pixelated",
      }}
    />
  );

  if (!href || !isSafeHref(href)) {
    return image;
  }

  const external = isExternalLink(href);
  return (
    <Box
      as="a"
      href={href}
      css={{ display: "block", lineHeight: 0 }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {image}
    </Box>
  );
}
