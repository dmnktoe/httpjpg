import { Box, Image, VStack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { OBJECT_FIT_OPTIONS } from "./storybook-helpers";

/**
 * Image component stories
 *
 * A powerful image component with copyright support and blur-up loading.
 * Perfect for brutalist portfolio websites and Storyblok integration.
 */
const meta = {
  title: "Components/Image",
  component: Image,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "Image source URL",
    },
    alt: {
      control: "text",
      description: "Alt text for accessibility",
    },
    copyright: {
      control: "text",
      description: "Copyright text",
    },
    copyrightPosition: {
      control: { type: "select" as const },
      options: ["inline", "below", "overlay"] as const,
      description: "Copyright text position",
      table: {
        defaultValue: { summary: "inline" },
      },
    },
    blurOnLoad: {
      control: "boolean",
      description: "Enable blur-up loading effect",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    objectFit: {
      control: { type: "select" as const },
      options: OBJECT_FIT_OPTIONS,
      description: "Object fit property",
      table: {
        defaultValue: { summary: "cover" },
      },
    },
    aspectRatio: {
      control: "text",
      description: "Aspect ratio (e.g., '16/9', '1/1', '4/3')",
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic image with live controls
 */
export const Basic: Story = {
  args: {
    src: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 1",
    aspectRatio: "16/9",
    copyright: "",
    copyrightPosition: "inline",
    blurOnLoad: false,
    objectFit: "cover",
  },
};

/**
 * Image with inline copyright (bottom right)
 */
export const InlineCopyright: Story = {
  args: {
    src: "https://a.storyblok.com//f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 2",
    copyright: "© 2025 John Doe",
    copyrightPosition: "inline",
    aspectRatio: "4/3",
  },
};

/**
 * Image with copyright below
 */
export const BelowCopyright: Story = {
  args: {
    src: "https://a.storyblok.com//f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Video still 3",
    copyright: "© 2025 Jane Smith / Unsplash",
    copyrightPosition: "below",
    aspectRatio: "16/9",
  },
};

/**
 * Image with overlay copyright (gradient bottom)
 * Modern design with decorative ASCII elements
 */
export const OverlayCopyright: Story = {
  args: {
    src: "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)",
    alt: "Klosterkirche Nordshausen",
    copyright: "⋆.˚ ᡣ𐭩 .𖥔˚ © 2025 ˙✧˖°📷 ༘ ⋆｡˚ Photographer Name",
    copyrightPosition: "overlay",
    aspectRatio: "21/9",
  },
};

/**
 * Image with blur-up loading
 * Progressive loading with decorative copyright
 */
export const BlurUpLoading: Story = {
  args: {
    src: "https://a.storyblok.com//f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)",
    alt: "Loading example",
    blurOnLoad: true,
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB//2Q==",
    copyright: "🎀 ୧ꔛꗃ˖ © 2025 Studio Name ･ﾟ⋆",
    copyrightPosition: "inline",
    aspectRatio: "4/3",
  },
};

/**
 * Portrait image (9:16)
 * Vertical format with overlay copyright
 */
export const Portrait: Story = {
  args: {
    src: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Portrait format",
    copyright: "⇝ © 2025 ୧ꔛꗃ˖ Artist",
    copyrightPosition: "overlay",
    aspectRatio: "9/16",
  },
};

/**
 * Square image (1:1)
 * Perfect square with copyright below
 */
export const Square: Story = {
  args: {
    src: "https://a.storyblok.com//f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
    alt: "Square format",
    copyright: "⋆.˚✮🎧✮˚.⋆ © 2025 Creator",
    copyrightPosition: "below",
    aspectRatio: "1/1",
  },
};

/**
 * Gallery with different copyright styles
 */
export const Gallery: Story = {
  args: {
    src: "",
    alt: "",
  },
  render: () => (
    <VStack gap={8} style={{ padding: "2rem" }}>
      <Box>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 1"
          copyright="© 2025 John Architect"
          copyrightPosition="inline"
          aspectRatio="16/9"
        />
      </Box>

      <Box>
        <Image
          src="https://a.storyblok.com//f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 2"
          copyright="© 2025 Jane Designer"
          copyrightPosition="below"
          aspectRatio="4/3"
        />
      </Box>

      <Box>
        <Image
          src="https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Klosterkirche Nordshausen"
          copyright="© 2025 Studio XYZ"
          copyrightPosition="overlay"
          aspectRatio="21/9"
        />
      </Box>
    </VStack>
  ),
};

/**
 * Brutalist card with image
 */
export const BrutalistCard: Story = {
  args: {
    src: "",
    alt: "",
  },
  render: () => (
    <Box
      style={{
        maxWidth: "600px",
        background: "transparent",
        position: "relative",
      }}
    >
      <Image
        src="https://a.storyblok.com//f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
        alt="Featured work"
        copyright="© 2025 httpjpg"
        copyrightPosition="overlay"
        aspectRatio="16/9"
      />
      <Box style={{ padding: "1.5rem 0", fontFamily: "sans-serif" }}>
        <Box
          style={{
            fontSize: "0.65rem",
            marginBottom: "0.75rem",
            letterSpacing: "0.1em",
            opacity: 0.6,
          }}
        >
          ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S / 2025
        </Box>
        <h3
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          ⋆.˚ ᡣ𐭩 .𖥔˚ Featured Work ⋆.˚✮
        </h3>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            opacity: 0.8,
            lineHeight: 1.6,
          }}
        >
          🎀 ୧ꔛꗃ˖ Bold visual storytelling with modern aesthetics ･ﾟ⋆
        </p>
      </Box>
    </Box>
  ),
};
