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
import type { SbReactRichTextComponentMap, SbReactRichTextProps } from "@storyblok/react/rsc";

function ParagraphRenderer({ children }: SbReactRichTextProps<"paragraph">) {
  return <Paragraph spacing>{children}</Paragraph>;
}

function HeadingRenderer({ attrs, children }: SbReactRichTextProps<"heading">) {
  const level = attrs?.level ?? 1;
  // Headline only styles levels 1–3; render deeper headings at the level-3
  // scale while keeping the semantic `h4`–`h6` tag for accessibility.
  const headlineLevel = (level <= 3 ? level : 3) as 1 | 2 | 3;
  const tag = level > 3 ? (`h${level}` as "h4" | "h5" | "h6") : undefined;
  return (
    <Headline level={headlineLevel} as={tag} marginTop="6" marginBottom="3">
      {children}
    </Headline>
  );
}

function BulletListRenderer({ children }: SbReactRichTextProps<"bullet_list">) {
  return <UnorderedList>{children}</UnorderedList>;
}

function OrderedListRenderer({ children }: SbReactRichTextProps<"ordered_list">) {
  return <OrderedList>{children}</OrderedList>;
}

function ListItemRenderer({ children }: SbReactRichTextProps<"list_item">) {
  return <ListItem>{children}</ListItem>;
}

function BlockquoteRenderer({ children }: SbReactRichTextProps<"blockquote">) {
  return (
    <Box
      as="blockquote"
      css={{
        my: "6",
        py: "2",
        pl: "4",
        color: "neutral.600",
        fontStyle: "italic",
        borderColor: "neutral.300",
        borderLeft: "4px solid",
      }}
    >
      {children}
    </Box>
  );
}

function HorizontalRuleRenderer(_props: SbReactRichTextProps<"horizontal_rule">) {
  return <Divider variant="ascii" spacing="8" color="neutral.400" />;
}

function CodeBlockRenderer({ children }: SbReactRichTextProps<"code_block">) {
  return (
    <Box
      as="pre"
      css={{
        my: "6",
        p: "4",
        color: "white",
        fontFamily: "mono",
        fontSize: "sm",
        bg: "neutral.900",
        borderRadius: "md",
        overflow: "auto",
      }}
    >
      {children}
    </Box>
  );
}

function ImageRenderer({ attrs }: SbReactRichTextProps<"image">) {
  const src = attrs?.src ?? "";
  if (!src) {
    return null;
  }
  const alt = attrs?.alt ?? attrs?.meta_data?.alt ?? "";
  const title = attrs?.title ?? attrs?.meta_data?.title ?? undefined;
  const copyright = attrs?.copyright ?? attrs?.meta_data?.copyright ?? undefined;
  return (
    <Box css={{ my: "6" }}>
      <Image
        src={src}
        alt={alt}
        title={title ?? undefined}
        copyright={copyright ?? undefined}
        copyrightPosition="below"
        aspectRatio="16/9"
        objectFit="cover"
      />
    </Box>
  );
}

// Emoji is glyph-sized and inline; rendering it through the block Image wrapper
// blows it up to 16:9 and nests a <div> inside <p>, breaking hydration.
function EmojiRenderer({ attrs }: SbReactRichTextProps<"emoji">) {
  const fallbackImage = attrs?.fallbackImage;
  const name = attrs?.name;
  const emoji = attrs?.emoji;
  if (fallbackImage) {
    return (
      <img
        src={fallbackImage}
        alt={name ?? emoji ?? ""}
        data-emoji={name}
        draggable={false}
        loading="lazy"
        style={{
          width: "1.25em",
          height: "1.25em",
          verticalAlign: "text-top",
          display: "inline-block",
        }}
      />
    );
  }
  return <>{emoji ?? null}</>;
}

// CMS-authored hrefs: block any explicit scheme outside the allowlist so a
// `javascript:`/`data:` URL can't be emitted. Scheme-less values (relative
// paths, anchors, bare emails) are allowed through. Control chars are stripped
// first because browsers ignore them when resolving the scheme.
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

function LinkRenderer({ attrs, children }: SbReactRichTextProps<"link">) {
  const href = attrs?.href;
  if (!href || !isSafeHref(href)) {
    return <>{children}</>;
  }
  const target = attrs?.target === "_blank" || attrs?.target === "_self" ? attrs.target : undefined;
  // Forward target/rel only when explicitly set; Link spreads our props after
  // its own external-link defaults, so passing `undefined` would clobber them.
  const linkProps =
    target === "_blank"
      ? { target: "_blank" as const, rel: "noopener noreferrer" }
      : target === "_self"
        ? { target: "_self" as const }
        : {};
  return (
    <Link href={href} {...linkProps}>
      {children}
    </Link>
  );
}

function InlineCodeRenderer({ children }: SbReactRichTextProps<"code">) {
  return (
    <Box
      as="code"
      css={{
        px: "1",
        py: "0.5",
        fontFamily: "mono",
        fontSize: "sm",
        bg: "neutral.100",
        borderRadius: "sm",
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Maps Storyblok richtext node and mark types to `@httpjpg/ui` primitives.
 * Types not listed here fall back to the v5 SDK's default tag rendering
 * (e.g. `bold` → `<strong>`, `italic` → `<em>`).
 */
export const richTextComponents: SbReactRichTextComponentMap = {
  paragraph: ParagraphRenderer,
  heading: HeadingRenderer,
  bullet_list: BulletListRenderer,
  ordered_list: OrderedListRenderer,
  list_item: ListItemRenderer,
  blockquote: BlockquoteRenderer,
  horizontal_rule: HorizontalRuleRenderer,
  code_block: CodeBlockRenderer,
  image: ImageRenderer,
  emoji: EmojiRenderer,
  link: LinkRenderer,
  code: InlineCodeRenderer,
};
