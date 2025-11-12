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
 * Basic image without copyright
 */
export const Basic: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop",
    alt: "Modern architecture",
    aspectRatio: "16/9",
  },
};

/**
 * Image with inline copyright (bottom right)
 */
export const InlineCopyright: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&auto=format&fit=crop",
    alt: "Minimalist interior",
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
    src: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop",
    alt: "Abstract composition",
    copyright: "© 2025 Jane Smith / Unsplash",
    copyrightPosition: "below",
    aspectRatio: "16/9",
  },
};

/**
 * Image with overlay copyright (gradient bottom)
 */
export const OverlayCopyright: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1200&auto=format&fit=crop",
    alt: "Urban landscape",
    copyright: "© 2025 Photographer Name",
    copyrightPosition: "overlay",
    aspectRatio: "21/9",
  },
};

/**
 * Image with blur-up loading
 */
export const BlurUpLoading: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&auto=format&fit=crop",
    alt: "Loading example",
    blurOnLoad: true,
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB//2Q==",
    copyright: "© 2025 Studio Name",
    copyrightPosition: "inline",
    aspectRatio: "4/3",
  },
};

/**
 * Portrait image (9:16)
 */
export const Portrait: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1400&auto=format&fit=crop",
    alt: "Portrait format",
    copyright: "© 2025 Artist",
    copyrightPosition: "overlay",
    aspectRatio: "9/16",
  },
};

/**
 * Square image (1:1)
 */
export const Square: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1000&auto=format&fit=crop",
    alt: "Square format",
    copyright: "© 2025 Creator",
    copyrightPosition: "below",
    aspectRatio: "1/1",
  },
};

/**
 * Gallery with different copyright styles
 */
export const Gallery: Story = {
  render: () => (
    <VStack gap={8} style={{ padding: "2rem" }}>
      <Box>
        <Image
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop"
          alt="Architecture 1"
          copyright="© 2025 John Architect"
          copyrightPosition="inline"
          aspectRatio="16/9"
        />
      </Box>

      <Box>
        <Image
          src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&auto=format&fit=crop"
          alt="Architecture 2"
          copyright="© 2025 Jane Designer / Unsplash"
          copyrightPosition="below"
          aspectRatio="4/3"
        />
      </Box>

      <Box>
        <Image
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop"
          alt="Architecture 3"
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
  render: () => (
    <Box
      style={{
        maxWidth: "600px",
        border: "4px solid black",
        boxShadow: "12px 12px 0 black",
        background: "white",
      }}
    >
      <Image
        src="https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=1200&auto=format&fit=crop"
        alt="Featured work"
        copyright="© 2025 Photographer Name"
        copyrightPosition="overlay"
        aspectRatio="16/9"
        style={{ filter: "grayscale(100%)" }}
      />
      <Box style={{ padding: "2rem" }}>
        <Box
          style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            marginBottom: "0.5rem",
            opacity: 0.5,
          }}
        >
          PROJECT / 2025
        </Box>
        <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Brutalist Design</h3>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          Bold typography and strong visual hierarchy create impact.
        </p>
      </Box>
    </Box>
  ),
};
