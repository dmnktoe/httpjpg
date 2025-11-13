import { Box, NavLink } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/NavLink",
  component: NavLink,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Specialized navigation link component with decorative prefixes for personal/things work and client work. Features hover underline and inherits all Link capabilities including Next.js routing and Storyblok compatibility.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["personal", "client"],
      description: "Visual variant with decorative prefix",
    },
    href: {
      control: "text",
      description: "Link destination",
    },
    children: {
      control: "text",
      description: "Link content (work title)",
    },
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic personal/things work link with decorative emoji prefix
 */
export const Basic: Story = {
  args: {
    variant: "personal",
    href: "/work/project-alpha",
    children: "Project Alpha - Photography Series",
  },
};

/**
 * Personal work variant (default)
 */
export const Personal: Story = {
  args: {
    variant: "personal",
    href: "/work/urban-exploration",
    children: "Urban Exploration 2024",
  },
};

/**
 * Client work variant with different decorative prefix
 */
export const Client: Story = {
  args: {
    variant: "client",
    href: "/work/client-brand-design",
    children: "Brand Identity - Tech Startup",
  },
};

/**
 * External personal work link
 */
export const PersonalExternal: Story = {
  args: {
    variant: "personal",
    href: "https://behance.net/project/example",
    children: "Featured on Behance",
  },
};

/**
 * External client work link
 */
export const ClientExternal: Story = {
  args: {
    variant: "client",
    href: "https://dribbble.com/shots/example",
    children: "Dribbble Case Study",
  },
};

/**
 * Long text overflow handling
 */
export const LongText: Story = {
  args: {
    variant: "personal",
    href: "/work/long-title",
    children:
      "This is a very long project title that will be truncated with ellipsis to maintain layout integrity",
  },
  decorators: [
    (Story) => (
      <Box css={{ maxW: "xs" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Custom styles override
 */
export const CustomStyles: Story = {
  args: {
    variant: "client",
    href: "/work/premium-project",
    children: "Premium Client Project",
    css: {
      color: "purple.600",
      fontWeight: "bold",
      fontSize: "lg",
    },
  },
};

/**
 * Storyblok integration example
 */
export const StoryblokWork: Story = {
  args: {
    variant: "personal",
    href: "",
    children: "Photography Exhibition 2024",
    storyblokLink: {
      linktype: "story",
      cached_url: "work/photography-exhibition-2024",
    },
  },
};

/**
 * Navigation list - Personal work
 */
export const PersonalWorkList = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "2",
        maxW: "md",
      }}
    >
      <NavLink variant="personal" href="/work/photo-series-1">
        Analog Photography Series
      </NavLink>
      <NavLink variant="personal" href="/work/digital-art">
        Digital Art Collection
      </NavLink>
      <NavLink variant="personal" href="/work/experimental">
        Experimental Film Project
      </NavLink>
      <NavLink variant="personal" href="https://instagram.com/example">
        Instagram Portfolio
      </NavLink>
    </Box>
  ),
};

/**
 * Navigation list - Client work
 */
export const ClientWorkList = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "2",
        maxW: "md",
      }}
    >
      <NavLink variant="client" href="/work/brand-identity">
        Brand Identity Design
      </NavLink>
      <NavLink variant="client" href="/work/web-design">
        E-Commerce Website
      </NavLink>
      <NavLink variant="client" href="/work/campaign">
        Marketing Campaign
      </NavLink>
      <NavLink variant="client" href="/work/packaging">
        Product Packaging
      </NavLink>
    </Box>
  ),
};

/**
 * Mixed navigation list (both variants)
 */
export const MixedNavigation = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "4",
        maxW: "md",
      }}
    >
      <Box>
        <Box as="span" css={{ fontWeight: "bold", display: "block", mb: "2" }}>
          ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
        </Box>
        <Box css={{ display: "flex", flexDirection: "column", gap: "1" }}>
          <NavLink variant="personal" href="/work/personal-1">
            Personal Project One
          </NavLink>
          <NavLink variant="personal" href="/work/personal-2">
            Personal Project Two
          </NavLink>
        </Box>
      </Box>

      <Box>
        <Box as="span" css={{ fontWeight: "bold", display: "block", mb: "2" }}>
          ⇝ᵣₑcꫀₙₜ 𝒞𝓁LI€NT
        </Box>
        <Box css={{ display: "flex", flexDirection: "column", gap: "1" }}>
          <NavLink variant="client" href="/work/client-1">
            Client Project One
          </NavLink>
          <NavLink variant="client" href="/work/client-2">
            Client Project Two
          </NavLink>
        </Box>
      </Box>
    </Box>
  ),
};
