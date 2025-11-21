import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { DynamicRender } from "@httpjpg/storyblok-utils";
import {
  Box,
  Button,
  Headline,
  Image,
  Link,
  Page,
  Paragraph,
} from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";

/**
 * Storyblok Image Type
 */
export interface SbImageType {
  id: number;
  alt?: string;
  name?: string;
  focus?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: string;
}

/**
 * Storyblok Link Type
 */
export interface SbLinkType {
  id?: string;
  url?: string;
  linktype?: "url" | "story" | "asset" | "email";
  fieldtype?: string;
  cached_url?: string;
}

/**
 * Work Page Component Props
 */
export interface SbPageWorkProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    title?: string;
    description?: StoryblokRichTextProps["data"];
    images?: SbImageType[];
    isDark?: boolean;
    link?: SbLinkType;
  };
}

/**
 * Work/Portfolio Page Layout for Storyblok
 * Includes hero section with title, description, images, and link
 */
export function SbPageWork({ blok }: SbPageWorkProps) {
  const { body, title, description, images, link, isDark = false } = blok;

  return (
    <Page
      {...storyblokEditable(blok)}
      css={{
        bg: isDark ? "black" : "white",
        color: isDark ? "white" : "black",
      }}
    >
      {/* Hero Section */}
      {(title || description || images || link) && (
        <Box
          as="section"
          css={{
            py: "16",
            px: "4",
            maxW: "6xl",
            mx: "auto",
          }}
        >
          {title && (
            <Headline level={1} css={{ mb: "6" }}>
              {title}
            </Headline>
          )}

          {description && (
            <Box css={{ mb: "8", maxW: "prose" }}>
              <Paragraph size="lg">
                <StoryblokRichText data={description} />
              </Paragraph>
            </Box>
          )}

          {images && images.length > 0 && (
            <Box
              css={{
                display: "grid",
                gridTemplateColumns: { base: "1", md: "2" },
                gap: "4",
                mb: "8",
              }}
            >
              {images.map((image) => (
                <Image
                  key={image.id}
                  src={image.filename}
                  alt={image.alt || image.title || ""}
                  css={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "md",
                  }}
                />
              ))}
            </Box>
          )}

          {link && link.url && (
            <Link
              href={link.url}
              target={link.linktype === "url" ? "_blank" : undefined}
            >
              <Button
                css={{
                  bg: "spotify.green",
                  color: "white",
                  _hover: { opacity: "0.9" },
                }}
              >
                View Project
              </Button>
            </Link>
          )}
        </Box>
      )}

      {/* Body Content */}
      {body && <DynamicRender data={body as any} />}
    </Page>
  );
}
