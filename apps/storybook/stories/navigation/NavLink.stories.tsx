import { Box, NavLink } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

const meta = {
  title: "Navigation/NavLink",
  component: NavLink,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Specialized navigation link component with decorative prefixes for projects/things work and websites work. Features hover underline and inherits all Link capabilities including Next.js routing and Storyblok compatibility.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "inline-radio" as const },
      options: ["projects", "websites"] as const,
      description: "Visual variant with decorative prefix",
      table: { defaultValue: { summary: "projects" } },
    },
    href: { control: "text", description: "Link destination" },
    children: { control: "text", description: "Link content (work title)" },
    isExternal: {
      control: "boolean",
      description: "Force external link behavior (auto-detected by default)",
    },
    showExternalIcon: {
      control: "boolean",
      description: "Show external link icon (↗) for external links",
    },
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Italic year prefix, mirroring how the Header renders recent work. */
function Year({ children }: { children: ReactNode }) {
  return (
    <Box as="span" css={{ fontStyle: "italic" }}>
      {children}{" "}
    </Box>
  );
}

/**
 * Basic personal/things work link with decorative emoji prefix
 */
export const Basic: Story = {
  args: {
    variant: "projects",
    href: "/work/project-alpha",
    children: "Project Alpha - Photography Series",
  },
};

/**
 * Personal work variant (default)
 */
export const Personal: Story = {
  args: {
    variant: "projects",
    href: "/work/urban-exploration",
    children: "Urban Exploration 2024",
  },
};

/**
 * Client work variant with different decorative prefix
 */
export const Client: Story = {
  args: {
    variant: "websites",
    href: "/work/client-brand-design",
    children: "Brand Identity - Tech Startup",
  },
};

/**
 * External personal work link
 */
export const PersonalExternal: Story = {
  args: {
    variant: "projects",
    href: "https://behance.net/project/example",
    children: "Featured on Behance",
  },
};

/**
 * External client work link
 */
export const ClientExternal: Story = {
  args: {
    variant: "websites",
    href: "https://dribbble.com/shots/example",
    children: "Dribbble Case Study",
  },
};

/**
 * Long text overflow handling
 */
export const LongText: Story = {
  args: {
    variant: "projects",
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
    variant: "websites",
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
    variant: "projects",
    href: "",
    children: "Photography Exhibition 2024",
  },
};

/**
 * With a leading year — mirrors the Header, where each recent-work link is
 * prefixed with an italic year before the title.
 */
export const WithYear = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", gap: "1", maxW: "md" }}>
      <NavLink variant="projects" href="/work/analog-series">
        <Year>2024</Year>
        Analog Photography Series
      </NavLink>
      <NavLink variant="websites" href="/work/shop-redesign">
        <Year>2023</Year>
        E-Commerce Redesign
      </NavLink>
    </Box>
  ),
};

/**
 * Navigation list - Personal work
 */
export const ProjectsWorkList = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "2",
        maxW: "md",
      }}
    >
      <NavLink variant="projects" href="/work/photo-series-1">
        <Year>2024</Year>
        Analog Photography Series
      </NavLink>
      <NavLink variant="projects" href="/work/digital-art">
        <Year>2023</Year>
        Digital Art Collection
      </NavLink>
      <NavLink variant="projects" href="/work/experimental">
        <Year>2022</Year>
        Experimental Film Project
      </NavLink>
      <NavLink variant="projects" href="https://instagram.com/example">
        Instagram Portfolio
      </NavLink>
    </Box>
  ),
};

/**
 * Navigation list - Client work
 */
export const WebsitesWorkList = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "2",
        maxW: "md",
      }}
    >
      <NavLink variant="websites" href="/work/brand-identity">
        <Year>2025</Year>
        Brand Identity Design
      </NavLink>
      <NavLink variant="websites" href="/work/web-design">
        <Year>2024</Year>
        E-Commerce Website
      </NavLink>
      <NavLink variant="websites" href="/work/campaign">
        <Year>2023</Year>
        Marketing Campaign
      </NavLink>
      <NavLink variant="websites" href="/work/packaging">
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
        <Box as="span" css={{ display: "block", mb: "2", fontWeight: "bold" }}>
          ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
        </Box>
        <Box css={{ display: "flex", flexDirection: "column", gap: "1" }}>
          <NavLink variant="projects" href="/work/personal-1">
            <Year>2024</Year>
            Personal Project One
          </NavLink>
          <NavLink variant="projects" href="/work/personal-2">
            <Year>2023</Year>
            Personal Project Two
          </NavLink>
        </Box>
      </Box>

      <Box>
        <Box as="span" css={{ display: "block", mb: "2", fontWeight: "bold" }}>
          ⇝ᵣₑcꫀₙₜ 𝒞𝓁LI€NT
        </Box>
        <Box css={{ display: "flex", flexDirection: "column", gap: "1" }}>
          <NavLink variant="websites" href="/work/client-1">
            <Year>2025</Year>
            Client Project One
          </NavLink>
          <NavLink variant="websites" href="/work/client-2">
            <Year>2024</Year>
            Client Project Two
          </NavLink>
        </Box>
      </Box>
    </Box>
  ),
};
