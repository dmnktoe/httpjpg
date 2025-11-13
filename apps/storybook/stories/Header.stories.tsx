import { Header } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Header component stories
 *
 * Brutalist navigation header with ASCII art decorations.
 * Features responsive mobile menu and sections for recent work.
 */
const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    nav: {
      control: "object",
      description: "Navigation items for the main menu",
    },
    personalWork: {
      control: "object",
      description: "Recent personal work items",
    },
    clientWork: {
      control: "object",
      description: "Recent client work items",
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNav = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Work", href: "/work" },
  { name: "Contact", href: "/contact" },
];

const mockPersonalWork = [
  { id: "1", slug: "brutalist-portfolio", title: "Brutalist Portfolio 2024" },
  { id: "2", slug: "design-system", title: "httpjpg Design System" },
  { id: "3", slug: "experimental-ui", title: "Experimental UI Kit" },
  { id: "4", slug: "ascii-art-generator", title: "ASCII Art Generator" },
];

const mockClientWork = [
  { id: "1", slug: "client-project-1", title: "Client Alpha - Branding" },
  { id: "2", slug: "client-project-2", title: "Client Beta - Web Design" },
  { id: "3", slug: "client-project-3", title: "Client Gamma - App Dev" },
];

/**
 * Basic header with live controls
 */
export const Basic: Story = {
  args: {
    nav: mockNav,
    personalWork: mockPersonalWork,
    clientWork: mockClientWork,
  },
};

/**
 * Header with minimal navigation
 */
export const MinimalNav: Story = {
  args: {
    nav: [
      { name: "Home", href: "/" },
      { name: "Work", href: "/work" },
    ],
    personalWork: mockPersonalWork.slice(0, 2),
    clientWork: mockClientWork.slice(0, 2),
  },
};

/**
 * Header with external links
 */
export const WithExternalLinks: Story = {
  args: {
    nav: [
      { name: "Home", href: "/" },
      { name: "GitHub", href: "https://github.com", isExternal: true },
      { name: "Twitter", href: "https://twitter.com", isExternal: true },
    ],
    personalWork: mockPersonalWork,
    clientWork: [],
  },
};

/**
 * Header with no work items
 */
export const NoWorkItems: Story = {
  args: {
    nav: mockNav,
    personalWork: [],
    clientWork: [],
  },
};

/**
 * Full example with demo content below
 */
export const WithContent: Story = {
  args: {
    nav: mockNav,
    personalWork: mockPersonalWork,
    clientWork: mockClientWork,
  },
  render: (args) => (
    <>
      <Header {...args} />
      <main style={{ padding: "2rem" }}>
        <div
          style={{
            maxWidth: "1024px",
            margin: "0 auto",
            padding: "4rem 2rem",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            Welcome to httpjpg
          </h1>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.6, opacity: 0.8 }}>
            This is a demo page showing how the header looks with content below
            it. The header features a unique brutalist ASCII art design that's
            both functional and visually striking.
          </p>
          <div style={{ marginTop: "4rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              About the Design
            </h2>
            <p style={{ lineHeight: 1.75, opacity: 0.8 }}>
              The header embraces a brutalist aesthetic with decorative ASCII
              characters, creating a unique and memorable navigation experience.
              On desktop, it displays three columns showing navigation links,
              recent personal work, and client projects. On mobile, it
              transforms into a sleek overlay menu.
            </p>
          </div>
        </div>
      </main>
    </>
  ),
};
