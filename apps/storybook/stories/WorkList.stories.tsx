import { Box, Headline, Paragraph, WorkList } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { OPTIMIZED_IMAGES } from "./storybook-fixtures";

/**
 * WorkList component stories
 *
 * Portfolio work showcase list built on VStack with optional dividers.
 * Displays WorkCard components with slideshow, animated titles, and project details.
 */
const meta = {
  title: "Components/WorkList",
  component: WorkList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WorkList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample work data
const sampleWorks = [
  {
    title: "Brand Identity",
    description:
      "Comprehensive brand identity system for a modern tech startup. Includes logo design, color palette, typography, and brand guidelines.",
    date: "2024-03-15",
    slug: "brand-identity",
    images: [
      {
        url: OPTIMIZED_IMAGES.outletStore1,
        alt: "Outlet Store 1",
      },
      {
        url: OPTIMIZED_IMAGES.outletStore2,
        alt: "Outlet Store 2",
        copyright: "Studio XYZ",
      },
    ],
  },
  {
    title: "E-Commerce Redesign",
    description:
      "Complete redesign of an e-commerce platform focusing on user experience, conversion optimization, and mobile-first design principles.",
    date: "2024-02-20",
    slug: "ecommerce-redesign",
    images: [
      {
        url: OPTIMIZED_IMAGES.outletStore3,
        alt: "Outlet Store 3",
      },
      {
        url: OPTIMIZED_IMAGES.videoStill1,
        alt: "Video still 1",
      },
      {
        url: OPTIMIZED_IMAGES.landscape,
        alt: "Klosterkirche",
      },
    ],
  },
  {
    title: "Creative Exhibition",
    description:
      "Art direction and digital experience for a contemporary art exhibition. Interactive installations and immersive visual storytelling.",
    date: "2024-01-10",
    slug: "creative-exhibition",
    images: [
      {
        url: OPTIMIZED_IMAGES.outletStore2,
        alt: "Exhibition space",
        copyright: "John Photographer",
      },
    ],
  },
  {
    title: "Magazine Layout",
    description:
      "Editorial design for a fashion magazine. Clean typography, bold imagery, and modern layout systems that adapt to various content types.",
    date: "2023-12-05",
    slug: "magazine-layout",
    images: [
      {
        url: OPTIMIZED_IMAGES.videoStill2,
        alt: "Video still 2",
      },
      {
        url: OPTIMIZED_IMAGES.videoStill3,
        alt: "Video still 3",
      },
    ],
  },
];

/**
 * Default work list with multiple projects
 */
export const Default: Story = {
  args: {
    works: sampleWorks,
    gap: 24,
  },
};

/**
 * Work list with large spacing
 */
export const LargeSpacing: Story = {
  args: {
    works: sampleWorks,
    gap: 48,
  },
};

/**
 * Work list with compact spacing
 */
export const Compact: Story = {
  args: {
    works: sampleWorks,
    gap: 16,
  },
};

/**
 * Work list with header
 */
export const WithHeader: Story = {
  args: {
    works: sampleWorks,
    gap: 24,
    header: (
      <Box
        css={{
          w: "full",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: 16,
        }}
      >
        <Headline level={1} css={{ mb: 4 }}>
          Selected Works
        </Headline>
        <Paragraph css={{ fontSize: "lg", maxW: "2xl" }}>
          A curated collection of recent projects showcasing brand identities,
          digital experiences, and creative explorations.
        </Paragraph>
      </Box>
    ),
  },
};

/**
 * Work list with footer
 */
export const WithFooter: Story = {
  args: {
    works: sampleWorks.slice(0, 2),
    gap: 24,
    footer: (
      <Box
        css={{
          w: "full",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: 16,
        }}
      >
        <Headline level={2} css={{ mb: 4 }}>
          More Projects Coming Soon
        </Headline>
        <Paragraph css={{ fontSize: "lg" }}>
          Check back for updates or{" "}
          <Box
            as="a"
            href="/contact"
            css={{ color: "blue", textDecoration: "underline" }}
          >
            get in touch
          </Box>{" "}
          to discuss your project.
        </Paragraph>
      </Box>
    ),
  },
};

/**
 * Single work item
 */
export const Single: Story = {
  args: {
    works: [sampleWorks[0]],
  },
};

/**
 * Minimal work list (no descriptions)
 */
export const Minimal: Story = {
  args: {
    works: sampleWorks.map((work) => ({
      ...work,
      description: undefined,
    })),
    gap: 16,
  },
};

/**
 * Work list without dates
 */
export const NoDates: Story = {
  args: {
    works: sampleWorks.map((work) => ({
      ...work,
      date: undefined,
    })),
  },
};

/**
 * Work list with solid dividers
 */
export const WithSolidDividers: Story = {
  args: {
    works: sampleWorks,
    gap: 16,
    showDividers: true,
    dividerProps: {
      variant: "solid",
      color: "neutral.300",
      spacing: 12,
    },
  },
};

/**
 * Work list with dashed dividers
 */
export const WithDashedDividers: Story = {
  args: {
    works: sampleWorks,
    gap: 16,
    showDividers: true,
    dividerProps: {
      variant: "dashed",
      color: "neutral.400",
      thickness: "2px",
      spacing: 12,
    },
  },
};

/**
 * Work list with ASCII dividers (brutalist aesthetic)
 */
export const WithASCIIDividers: Story = {
  args: {
    works: sampleWorks,
    gap: 16,
    showDividers: true,
    dividerProps: {
      variant: "ascii",
      pattern: "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚",
      color: "neutral.500",
      spacing: 12,
    },
  },
};

/**
 * Work list with custom ASCII pattern
 */
export const WithCustomPattern: Story = {
  args: {
    works: sampleWorks.slice(0, 3),
    gap: 16,
    showDividers: true,
    dividerProps: {
      variant: "ascii",
      pattern: "· · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·",
      color: "neutral.600",
      spacing: 16,
    },
  },
};
