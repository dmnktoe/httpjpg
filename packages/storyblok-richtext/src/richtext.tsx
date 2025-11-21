import { Box, Headline, Link, Paragraph } from "@httpjpg/ui";
import type { ComponentProps, ReactNode } from "react";
import {
  MARK_CODE,
  MARK_LINK,
  NODE_CODEBLOCK,
  NODE_HEADING,
  NODE_IMAGE,
  NODE_PARAGRAPH,
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
 * Custom resolver for images
 */
function NodeImage(_children: ReactNode, props: any) {
  const { src, alt, title } = props;

  return (
    <Box css={{ my: "6" }}>
      <img
        src={src}
        alt={alt || ""}
        title={title}
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: "8px",
        }}
      />
    </Box>
  );
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
      [MARK_LINK]: MarkLink,
      [MARK_CODE]: MarkCode,
    },
    nodeResolvers: {
      [NODE_HEADING]: NodeHeading,
      [NODE_PARAGRAPH]: NodeParagraph,
      [NODE_IMAGE]: NodeImage,
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
