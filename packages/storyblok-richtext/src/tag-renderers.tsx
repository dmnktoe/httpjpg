import {
  Box,
  Divider,
  Headline,
  Image,
  Link,
  ListItem,
  OrderedList,
  Paragraph,
  UnorderedList,
} from "@httpjpg/ui";
import { createElement, type ReactNode } from "react";

export type TagAttrs = Record<string, unknown>;

export type TagRenderer = (
  key: string | undefined,
  attrs: TagAttrs,
  children: ReactNode,
) => ReactNode;

function headingRenderer(level: 1 | 2 | 3): TagRenderer {
  return (key, _attrs, children) => (
    <Headline key={key} level={level} marginTop="6" marginBottom="3">
      {children}
    </Headline>
  );
}

const renderImage: TagRenderer = (key, attrs, _children) => {
  const imgAttrs = attrs as {
    src?: string;
    alt?: string;
    title?: string;
    copyright?: string;
    "data-emoji"?: string;
    "data-name"?: string;
    loading?: "lazy" | "eager";
    style?: Record<string, string>;
  };
  // Emoji images are inline glyph-sized — rendering them through the block Image
  // wrapper blows them up to 16:9 and nests <div> inside <p>, breaking hydration.
  if (imgAttrs["data-emoji"]) {
    return (
      <img
        key={key}
        src={imgAttrs.src ?? ""}
        alt={imgAttrs.alt ?? ""}
        data-emoji={imgAttrs["data-emoji"]}
        data-name={imgAttrs["data-name"]}
        draggable={false}
        loading={imgAttrs.loading ?? "lazy"}
        style={imgAttrs.style}
      />
    );
  }
  return (
    <Box key={key} css={{ my: "6" }}>
      <Image
        src={imgAttrs.src ?? ""}
        alt={imgAttrs.alt ?? ""}
        title={imgAttrs.title}
        copyright={imgAttrs.copyright}
        copyrightPosition="below"
        aspectRatio="16/9"
        objectFit="cover"
      />
    </Box>
  );
};

const renderLink: TagRenderer = (key, attrs, children) => {
  const { href, target } = attrs as { href?: string; target?: string };
  if (!href) {
    return children;
  }
  const safeTarget = target === "_blank" || target === "_self" ? target : undefined;
  return (
    <Link
      key={key}
      href={href}
      target={safeTarget}
      rel={safeTarget === "_blank" ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
};

const renderCode: TagRenderer = (key, attrs, children) => {
  const { "data-inline-code": inline, ...rest } = attrs as TagAttrs & {
    "data-inline-code"?: string;
  };
  if (inline) {
    return (
      <Box
        key={key}
        as="code"
        css={{
          fontFamily: "mono",
          fontSize: "sm",
          bg: "neutral.100",
          px: "1",
          py: "0.5",
          borderRadius: "sm",
        }}
      >
        {children}
      </Box>
    );
  }
  return createElement("code", { ...rest, key }, children);
};

export const tagRenderers: Record<string, TagRenderer> = {
  p: (key, _attrs, children) => (
    <Paragraph key={key} maxWidth spacing>
      {children}
    </Paragraph>
  ),
  h1: headingRenderer(1),
  h2: headingRenderer(2),
  h3: headingRenderer(3),
  ul: (key, _attrs, children) => <UnorderedList key={key}>{children}</UnorderedList>,
  ol: (key, _attrs, children) => <OrderedList key={key}>{children}</OrderedList>,
  li: (key, _attrs, children) => <ListItem key={key}>{children}</ListItem>,
  blockquote: (key, _attrs, children) => (
    <Box
      key={key}
      as="blockquote"
      css={{
        borderLeft: "4px solid",
        borderColor: "neutral.300",
        pl: "4",
        py: "2",
        my: "6",
        fontStyle: "italic",
        color: "neutral.600",
      }}
    >
      {children}
    </Box>
  ),
  hr: (key) => <Divider key={key} variant="ascii" spacing="8" color="neutral.400" />,
  pre: (key, _attrs, children) => (
    <Box
      key={key}
      as="pre"
      css={{
        fontFamily: "mono",
        fontSize: "sm",
        bg: "neutral.900",
        color: "white",
        p: "4",
        borderRadius: "md",
        overflow: "auto",
        my: "6",
      }}
    >
      {children}
    </Box>
  ),
  img: renderImage,
  a: renderLink,
  code: renderCode,
};
