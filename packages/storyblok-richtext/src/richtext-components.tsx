import {
  Box,
  CopyrightLabel,
  Divider,
  Headline,
  Link,
  ListItem,
  OrderedList,
  Paragraph,
  UnorderedList,
} from "@httpjpg/ui";
import type { SbReactRichTextComponentMap, SbReactRichTextProps } from "@storyblok/react/rsc";

type RichTextAlign = "left" | "center" | "right" | "justify";

function resolveTextAlign(value: unknown): RichTextAlign | undefined {
  if (value === "left" || value === "center" || value === "right" || value === "justify") {
    return value;
  }
  return undefined;
}

function ParagraphRenderer({ attrs, children }: SbReactRichTextProps<"paragraph">) {
  return (
    <Paragraph spacing align={resolveTextAlign(attrs?.textAlign)}>
      {children}
    </Paragraph>
  );
}

function HeadingRenderer({ attrs, children }: SbReactRichTextProps<"heading">) {
  const level = attrs?.level ?? 1;
  const headlineLevel = (level <= 3 ? level : 3) as 1 | 2 | 3;
  const tag = level > 3 ? (`h${level}` as "h4" | "h5" | "h6") : undefined;
  return (
    <Headline
      level={headlineLevel}
      as={tag}
      marginTop="6"
      marginBottom="3"
      align={resolveTextAlign(attrs?.textAlign)}
    >
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
  const copyright = attrs?.copyright || attrs?.meta_data?.copyright || undefined;
  const source = attrs?.source || attrs?.meta_data?.source || undefined;
  const size = dimensionsFromSrc(src);

  return (
    <Box as="span" css={{ display: "block", my: "6" }}>
      <img
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        width={size?.width}
        height={size?.height}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
        }}
      />
      {copyright || source ? (
        <CopyrightLabel text={copyright} source={source} position="below" />
      ) : null}
    </Box>
  );
}

/** Storyblok asset URLs embed natural size as `/f/<space>/<W>x<H>/`. */
function dimensionsFromSrc(src: string): { width: number; height: number } | undefined {
  const match = /\/(\d+)x(\d+)\//.exec(src);
  if (!match) {
    return undefined;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) {
    return undefined;
  }
  return { width, height };
}

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
