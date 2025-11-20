import {
  Box,
  Divider,
  Headline,
  Paragraph,
  WorkCard,
  WorkList,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * WorkList component stories
 *
 * Portfolio work showcase list with slideshow, animated titles,
 * and project details. Perfect for displaying multiple projects.
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
        url: "https://a.storyblok.com/f/281211/5000x2400/609e58d1fb/outlet-store_slideshow-1.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Outlet Store 1",
      },
      {
        url: "https://a.storyblok.com/f/281211/5000x2400/7de0835b62/outlet-store_slideshow-2.jpg/m/2000x1125/smart/filters:quality(75)",
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
        url: "https://a.storyblok.com/f/281211/5000x2400/92dcf912ab/outlet-store_slideshow-3.jpg/m/2000x1125/smart/filters:quality(75)",
        alt: "Outlet Store 3",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 1",
      },
      {
        url: "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)",
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
        url: "https://a.storyblok.com/f/281211/5000x2400/7de0835b62/outlet-store_slideshow-2.jpg/m/2000x1125/smart/filters:quality(75)",
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
        url: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 2",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
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
  },
};

/**
 * Work list with custom gap
 */
export const CustomGap: Story = {
  args: {
    works: sampleWorks,
    gap: "192px",
  },
};

/**
 * Work list with compact gap
 */
export const Compact: Story = {
  args: {
    works: sampleWorks,
    gap: "48px",
  },
};

/**
 * Work list with header
 */
export const WithHeader: Story = {
  args: {
    works: sampleWorks,
    header: (
      <Box
        css={{
          px: { base: "16px", md: "48px" },
          py: "64px",
          textAlign: "center",
        }}
      >
        <Headline level={1} css={{ mb: "16px" }}>
          Selected Works
        </Headline>
        <Paragraph css={{ fontSize: "lg", maxW: "2xl", mx: "auto" }}>
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
    footer: (
      <Box
        css={{
          px: { base: "16px", md: "48px" },
          py: "64px",
          textAlign: "center",
        }}
      >
        <Headline level={2} css={{ mb: "16px" }}>
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
    gap: "64px",
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
 * Dark background showcase
 */
export const DarkBackground: Story = {
  args: {
    works: sampleWorks,
    css: {
      bg: "black",
      color: "white",
      py: "64px",
    },
  },
};

/**
 * Work list with ASCII dividers between items
 */
export const WithDividers: Story = {
  render: () => (
    <Box>
      {sampleWorks.map((work, index) => (
        <Box key={work.slug}>
          <WorkList works={[work]} />
          {index < sampleWorks.length - 1 && (
            <Box css={{ py: "96px" }}>
              <Divider variant="ascii" pattern="*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚" spacing="0" />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  ),
};

/**
 * Single customizable work card with live controls
 */
export const CustomizableWorkCard: Story = {
  render: (args) => (
    <WorkCard
      title={args.title || "My Project"}
      description={
        args.description ||
        "Project description goes here. You can edit this in the controls panel."
      }
      date={args.date || "2024-03-15"}
      slug={args.slug || "my-project"}
      images={
        args.images || [
          {
            url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
            alt: "Default image",
          },
        ]
      }
    />
  ),
  args: {
    title: "Brand Identity",
    description:
      "Comprehensive brand identity system for a modern tech startup. Includes logo design, color palette, typography, and brand guidelines.",
    date: "2024-03-15",
    slug: "brand-identity",
    images: [
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 1",
      },
      {
        url: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        alt: "Video still 2",
        copyright: "Studio XYZ",
      },
    ],
  },
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
      description: "Project date",
    },
    slug: {
      control: "text",
      description: "Project URL slug",
    },
    images: {
      control: "object",
      description: "Array of slideshow images",
    },
  },
};
