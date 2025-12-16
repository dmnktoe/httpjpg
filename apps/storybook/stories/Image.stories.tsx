import { Box, Image, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { OPTIMIZED_IMAGES } from "./storybook-fixtures";
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
      options: ["inline-white", "inline-black", "below", "overlay"] as const,
      description: "Copyright text position",
      table: {
        defaultValue: { summary: "inline-white" },
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
    src: OPTIMIZED_IMAGES.videoStill1,
    alt: "Video still 1",
    aspectRatio: "16/9",
    copyright: "",
    copyrightPosition: "inline-white",
    blurOnLoad: false,
    objectFit: "cover",
  },
};

/**
 * Image with inline copyright (bottom right)
 */
export const InlineCopyright: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill2,
    alt: "Video still 2",
    copyright: "2025 John Doe",
    copyrightPosition: "inline-white",
    aspectRatio: "4/3",
  },
};

/**
 * Image with copyright below
 */
export const BelowCopyright: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill3,
    alt: "Video still 3",
    copyright: "2025 Jane Smith / Unsplash",
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
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Klosterkirche Nordshausen",
    copyright: "⋆.˚ ᡣ𐭩 .𖥔˚ 2025 ˙✧˖°📷 ༘ ⋆｡˚ Photographer Name",
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
    src: OPTIMIZED_IMAGES.portrait,
    alt: "Loading example",
    blurOnLoad: true,
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB//2Q==",
    copyright: "🎀 ୧ꔛꗃ˖ 2025 Studio Name ･ﾟ⋆",
    copyrightPosition: "inline-white",
    aspectRatio: "4/3",
  },
};

/**
 * Portrait image (9:16)
 * Vertical format with overlay copyright
 */
export const Portrait: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill1,
    alt: "Portrait format",
    copyright: "⇝ 2025 ୧ꔛꗃ˖ Artist",
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
    src: OPTIMIZED_IMAGES.videoStill2,
    alt: "Square format",
    copyright: "⋆.˚✮🎧✮˚.⋆ 2025 Creator",
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
    <Stack direction="vertical" gap="8" css={{ padding: "2rem" }}>
      <Box>
        <Image
          src={OPTIMIZED_IMAGES.videoStill1}
          alt="Video still 1"
          copyright="2025 John Architect"
          copyrightPosition="inline-white"
          aspectRatio="16/9"
        />
      </Box>

      <Box>
        <Image
          src={OPTIMIZED_IMAGES.videoStill2}
          alt="Video still 2"
          copyright="2025 Jane Designer"
          copyrightPosition="below"
          aspectRatio="4/3"
        />
      </Box>

      <Box>
        <Image
          src={OPTIMIZED_IMAGES.landscape}
          alt="Klosterkirche Nordshausen"
          copyright="2025 Studio XYZ"
          copyrightPosition="overlay"
          aspectRatio="21/9"
        />
      </Box>
    </Stack>
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
        src={OPTIMIZED_IMAGES.videoStill3}
        alt="Featured work"
        copyright="2025 httpjpg"
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
