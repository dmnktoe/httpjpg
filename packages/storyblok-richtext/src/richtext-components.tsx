import {
  Box,
  Divider,
  Headline,
  Link,
  ListItem,
  OrderedList,
  Paragraph,
  UnorderedList,
} from "@httpjpg/ui";
import type {
  SbReactRichTextComponentMap,
  SbReactRichTextProps,
  SbRichTextNode,
} from "@storyblok/react/rsc";

const BADGE_HOSTS = ["img.shields.io", "shields.io", "badgen.net", "badge.fury.io"];

function isBadge(src: string): boolean {
  return BADGE_HOSTS.some((host) => src.includes(host)) || src.endsWith(".svg");
}

interface BadgeImageProps {
  src: string;
  alt: string;
  title?: string;
}

function BadgeImage({ src, alt, title }: BadgeImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      loading="lazy"
      style={{
        display: "inline-block",
        height: "1.5em",
        width: "auto",
        maxWidth: "100%",
        verticalAlign: "middle",
      }}
    />
  );
}

interface BadgeItem extends BadgeImageProps {
  key: string;
}

function badgeParagraph(content?: SbRichTextNode[]): BadgeItem[] | null {
  if (!content?.length) {
    return null;
  }
  const badges: BadgeItem[] = [];
  for (const node of content) {
    if (node.type === "hard_break") {
      continue;
    }
    if (node.type === "text" && !node.text.trim()) {
      continue;
    }
    if (node.type === "image" && node.attrs?.src && isBadge(node.attrs.src)) {
      const { src, alt, title, meta_data } = node.attrs;
      badges.push({
        src,
        alt: alt ?? meta_data?.alt ?? "",
        title: title ?? meta_data?.title ?? undefined,
        key: node._key ?? `badge-${badges.length}`,
      });
      continue;
    }
    return null;
  }
  return badges.length ? badges : null;
}

function ParagraphRenderer({ content, children }: SbReactRichTextProps<"paragraph">) {
  const badges = badgeParagraph(content);
  if (badges) {
    return (
      <Box
        as="span"
        css={{
          display: "inline-flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "2",
          mr: "2",
          mb: "2",
          verticalAlign: "middle",
        }}
      >
        {badges.map((badge) => (
          <BadgeImage key={badge.key} src={badge.src} alt={badge.alt} title={badge.title} />
        ))}
      </Box>
    );
  }
  return <Paragraph spacing>{children}</Paragraph>;
}

function HeadingRenderer({ attrs, children }: SbReactRichTextProps<"heading">) {
  const level = attrs?.level ?? 1;
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

  if (isBadge(src)) {
    return <BadgeImage src={src} alt={alt} title={title} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      loading="lazy"
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        margin: "1.5rem auto",
      }}
    />
  );
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
