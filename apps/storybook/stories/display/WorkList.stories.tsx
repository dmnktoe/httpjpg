import { Box, Headline, Paragraph, WorkList } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { MOCK_TAGGED_WORKS, OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const meta = {
  title: "Display/WorkList",
  component: WorkList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WorkList>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Default: Story = {
  args: {
    works: sampleWorks,
    gap: 24,
  },
};

export const WithTags: Story = {
  args: {
    works: MOCK_TAGGED_WORKS,
    gap: 24,
  },
};

export const WithTagFilter: Story = {
  args: {
    works: MOCK_TAGGED_WORKS,
    gap: 24,
    showTagFilter: true,
  },
};

export const TagFilterInGrid: Story = {
  args: {
    works: MOCK_TAGGED_WORKS,
    gap: 24,
    columns: 1,
    columnsMd: 2,
    columnsLg: 3,
    variant: "compact",
    showTagFilter: true,
  },
};

export const TagFilterWithoutTags: Story = {
  args: {
    works: sampleWorks,
    gap: 24,
    showTagFilter: true,
  },
};

export const LargeSpacing: Story = {
  args: {
    works: sampleWorks,
    gap: 48,
  },
};

export const Compact: Story = {
  args: {
    works: sampleWorks,
    gap: 16,
  },
};

export const WithHeader: Story = {
  args: {
    works: sampleWorks,
    gap: 24,
    header: (
      <Box
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          w: "full",
          py: 16,
          textAlign: "center",
        }}
      >
        <Headline level={1} css={{ mb: 4 }}>
          Selected Works
        </Headline>
        <Paragraph css={{ maxW: "2xl", fontSize: "lg" }}>
          A curated collection of recent projects showcasing brand identities, digital experiences,
          and creative explorations.
        </Paragraph>
      </Box>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    works: sampleWorks.slice(0, 2),
    gap: 24,
    footer: (
      <Box
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          w: "full",
          py: 16,
          textAlign: "center",
        }}
      >
        <Headline level={2} css={{ mb: 4 }}>
          More Projects Coming Soon
        </Headline>
        <Paragraph css={{ fontSize: "lg" }}>
          Check back for updates or{" "}
          <Box as="a" href="/contact" css={{ color: "blue", textDecoration: "underline" }}>
            get in touch
          </Box>{" "}
          to discuss your project.
        </Paragraph>
      </Box>
    ),
  },
};

export const Single: Story = {
  args: {
    works: [sampleWorks[0]],
  },
};

export const Minimal: Story = {
  args: {
    works: sampleWorks.map((work) => ({
      ...work,
      description: undefined,
    })),
    gap: 16,
  },
};

export const NoDates: Story = {
  args: {
    works: sampleWorks.map((work) => ({
      ...work,
      date: undefined,
    })),
  },
};

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

export const Empty: Story = {
  args: {
    works: [],
  },
};

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
