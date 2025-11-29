import { Box, Headline, Image, Link, Paragraph } from "@httpjpg/ui";
import type { ComponentProps, ReactNode } from "react";
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_LINK,
  MARK_STRIKE,
  MARK_UNDERLINE,
  NODE_BR,
  NODE_CODEBLOCK,
  NODE_HEADING,
  NODE_HR,
  NODE_IMAGE,
  NODE_LI,
  NODE_OL,
  NODE_PARAGRAPH,
  NODE_QUOTE,
  NODE_UL,
  render,
} from "storyblok-rich-text-react-renderer";

/**
 * Storyblok Rich Text type definition
 */
export type ISbRichtext = {
  type: string;
  content?: ISbRichtext[];
  [key: string]: any;
};

/**
 * Custom resolver for bold text
 */
function MarkBold(children: ReactNode) {
  return <strong>{children}</strong>;
}

/**
 * Custom resolver for italic text
 */
function MarkItalic(children: ReactNode) {
  return <em>{children}</em>;
}

/**
 * Custom resolver for strikethrough text
 */
function MarkStrike(children: ReactNode) {
  return <s>{children}</s>;
}

/**
 * Custom resolver for underlined text
 */
function MarkUnderline(children: ReactNode) {
  return <u>{children}</u>;
}

/**
 * Custom resolver for links in rich text
 */
function MarkLink(children: ReactNode, props: any) {
  const { linktype, href, target } = props;

  if (linktype === "email") {
    return <Link href={`mailto:${href}`}>{children}</Link>;
  }

  if (target === "_blank") {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    );
  }

  return <Link href={href}>{children}</Link>;
}

/**
 * Custom resolver for inline code
 */
function MarkCode(children: ReactNode) {
  return (
    <Box
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

/**
 * Custom resolver for headings
 */
function NodeHeading(children: ReactNode, props: any) {
  const level = props.level as 1 | 2 | 3;
  return (
    <Headline level={level} css={{ mt: "8", mb: "4" }}>
      {children}
    </Headline>
  );
}

/**
 * Custom resolver for paragraphs
 */
function NodeParagraph(children: ReactNode) {
  return <Paragraph css={{ mb: "4" }}>{children}</Paragraph>;
}

/**
 * Custom resolver for images - uses Image component from @httpjpg/ui
 */
function NodeImage(_children: ReactNode, props: any) {
  const { src, alt, title, copyright } = props;

  return (
    <Box css={{ my: "6" }}>
      <Image
        src={src}
        alt={alt || ""}
        title={title}
        copyright={copyright}
        copyrightPosition="below"
        aspectRatio="16/9"
        objectFit="cover"
      />
    </Box>
  );
}

/**
 * Custom resolver for unordered lists
 */
function NodeUL(children: ReactNode) {
  return (
    <Box
      as="ul"
      css={{
        listStyleType: "disc",
        pl: "6",
        my: "4",
        "& li": {
          mb: "2",
        },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Custom resolver for ordered lists
 */
function NodeOL(children: ReactNode) {
  return (
    <Box
      as="ol"
      css={{
        listStyleType: "decimal",
        pl: "6",
        my: "4",
        "& li": {
          mb: "2",
        },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Custom resolver for list items
 */
function NodeLI(children: ReactNode) {
  return (
    <Box as="li" css={{ fontSize: "sm", lineHeight: 1.75 }}>
      {children}
    </Box>
  );
}

/**
 * Custom resolver for blockquotes
 */
function NodeBlockquote(children: ReactNode) {
  return (
    <Box
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
  );
}

/**
 * Custom resolver for horizontal rules
 */
function NodeHR() {
  return (
    <Box
      as="hr"
      css={{
        border: "none",
        borderTop: "1px solid",
        borderColor: "neutral.200",
        my: "8",
      }}
    />
  );
}

/**
 * Custom resolver for line breaks
 */
function NodeBR() {
  return <br />;
}

/**
 * Custom resolver for code blocks
 */
function NodeCodeblock(children: ReactNode) {
  return (
    <Box
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
      <code>{children}</code>
    </Box>
  );
}

/**
 * Default resolver for embedded Storyblok components
 */
function DefaultBlokResolver(name: string, props: any) {
  console.warn(`Missing resolver for component: ${name}`, props);
  return null;
}

/**
 * Render Storyblok Rich Text to React components
 */
export function renderStoryblokRichText(data: ISbRichtext) {
  if (!data) {
    return null;
  }

  return render(data, {
    markResolvers: {
      [MARK_BOLD]: MarkBold,
      [MARK_ITALIC]: MarkItalic,
      [MARK_STRIKE]: MarkStrike,
      [MARK_UNDERLINE]: MarkUnderline,
      [MARK_LINK]: MarkLink,
      [MARK_CODE]: MarkCode,
    },
    nodeResolvers: {
      [NODE_HEADING]: NodeHeading,
      [NODE_PARAGRAPH]: NodeParagraph,
      [NODE_IMAGE]: NodeImage,
      [NODE_UL]: NodeUL,
      [NODE_OL]: NodeOL,
      [NODE_LI]: NodeLI,
      [NODE_QUOTE]: NodeBlockquote,
      [NODE_HR]: NodeHR,
      [NODE_BR]: NodeBR,
      [NODE_CODEBLOCK]: NodeCodeblock,
    },
    defaultBlokResolver: DefaultBlokResolver,
  });
}

/**
 * Storyblok Rich Text Component
 */
export interface StoryblokRichTextProps extends ComponentProps<"div"> {
  data?: ISbRichtext;
}

export function StoryblokRichText({ data, ...props }: StoryblokRichTextProps) {
  if (!data) {
    return null;
  }

  const content = renderStoryblokRichText(data);

  return <Box {...props}>{content}</Box>;
}
