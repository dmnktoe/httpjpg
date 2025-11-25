import { WorkCard } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { OPTIMIZED_IMAGES } from "./storybook-fixtures";

/**
 * WorkCard component stories
 *
 * Individual portfolio work card with slideshow, animated title, and project details.
 */
const meta = {
  title: "Components/WorkCard",
  component: WorkCard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Project title",
    },
    description: {
      control: "text",
      description: "Project description",
    },
    date: {
      control: "text",
      description: "Project date (ISO format)",
    },
    slug: {
      control: "text",
      description: "Project URL slug",
    },
    images: {
      control: "object",
      description:
        "Array of slideshow images with url, alt, and optional copyright",
    },
  },
} satisfies Meta<typeof WorkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default work card with multiple images
 */
export const Default: Story = {
  args: {
    title: "Brand Identity",
    description:
      "Comprehensive brand identity system for a modern tech startup. Includes logo design, color palette, typography, and brand guidelines.",
    date: "2024-03-15",
    slug: "brand-identity",
    images: [
      {
        url: OPTIMIZED_IMAGES.videoStill1,
        alt: "Video still 1",
      },
      {
        url: OPTIMIZED_IMAGES.videoStill2,
        alt: "Video still 2",
        copyright: "Studio XYZ",
      },
    ],
  },
};

/**
 * Work card with single image
 */
export const SingleImage: Story = {
  args: {
    title: "E-Commerce Redesign",
    description:
      "Complete redesign of an e-commerce platform focusing on user experience, conversion optimization, and mobile-first design principles.",
    date: "2024-02-20",
    slug: "ecommerce-redesign",
    images: [
      {
        url: OPTIMIZED_IMAGES.landscape,
        alt: "Klosterkirche",
      },
    ],
  },
};

/**
 * Work card without description
 */
export const NoDescription: Story = {
  args: {
    title: "Creative Exhibition",
    date: "2024-01-10",
    slug: "creative-exhibition",
    images: [
      {
        url: OPTIMIZED_IMAGES.outletStore1,
        alt: "Exhibition space",
        copyright: "John Photographer",
      },
    ],
  },
};

/**
 * Work card without date
 */
export const NoDate: Story = {
  args: {
    title: "Magazine Layout",
    description:
      "Editorial design for a fashion magazine. Clean typography, bold imagery, and modern layout systems that adapt to various content types.",
    slug: "magazine-layout",
    images: [
      {
        url: OPTIMIZED_IMAGES.videoStill3,
        alt: "Video still 3",
      },
    ],
  },
};

/**
 * Work card with multiple images (slideshow)
 */
export const MultipleImages: Story = {
  args: {
    title: "Photo Series",
    description:
      "A curated collection of architectural photography exploring light, form, and space in urban environments.",
    date: "2024-03-01",
    slug: "photo-series",
    images: [
      {
        url: OPTIMIZED_IMAGES.outletStore1,
        alt: "Outlet Store 1",
      },
      {
        url: OPTIMIZED_IMAGES.outletStore2,
        alt: "Outlet Store 2",
      },
      {
        url: OPTIMIZED_IMAGES.outletStore3,
        alt: "Outlet Store 3",
      },
      {
        url: OPTIMIZED_IMAGES.landscape,
        alt: "Landscape",
        copyright: "Architecture Studio",
      },
    ],
  },
};

/**
 * Minimal work card
 */
export const Minimal: Story = {
  args: {
    title: "Project Title",
    slug: "project-title",
    images: [
      {
        url: OPTIMIZED_IMAGES.videoStill1,
        alt: "Project image",
      },
    ],
  },
};

/**
 * Fully customizable work card with live controls (Playground)
 */
export const Playground: Story = {
  args: {
    title: "Brand Identity",
    description:
      "Comprehensive brand identity system for a modern tech startup. Includes logo design, color palette, typography, and brand guidelines.",
    date: "2024-03-15",
    slug: "brand-identity",
    images: [
      {
        url: OPTIMIZED_IMAGES.videoStill1,
        alt: "Video still 1",
      },
      {
        url: OPTIMIZED_IMAGES.videoStill2,
        alt: "Video still 2",
        copyright: "Studio XYZ",
      },
    ],
  },
};
