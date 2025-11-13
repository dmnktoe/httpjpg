import { Header } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Header component stories
 *
 * Brutalist navigation header with ASCII art decorations.
 * Features responsive mobile menu and sections for recent work.
 */
const meta = {
  title: "Navigation/Header",
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
    isDark: {
      control: "boolean",
      description: "Dark mode variant for dark backgrounds",
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

const mockExternalClientWork = [
  {
    id: "1",
    slug: "https://www.behance.net/gallery/example1",
    title: "Client Alpha - Branding",
  },
  {
    id: "2",
    slug: "https://dribbble.com/shots/example2",
    title: "Client Beta - Web Design",
  },
  {
    id: "3",
    slug: "https://www.awwwards.com/example3",
    title: "Client Gamma - App Dev",
  },
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
 * Header with external links only
 */
export const WithExternalLinks: Story = {
  args: {
    nav: [
      { name: "GitHub", href: "https://github.com/dmnktoe", isExternal: true },
      { name: "Behance", href: "https://www.behance.net", isExternal: true },
      { name: "Instagram", href: "https://instagram.com", isExternal: true },
    ],
    personalWork: [
      {
        id: "1",
        slug: "https://codepen.io/example1",
        title: "CodePen Experiments",
      },
      {
        id: "2",
        slug: "https://github.com/example2",
        title: "Open Source Projects",
      },
      { id: "3", slug: "https://dribbble.com/example3", title: "Design Shots" },
    ],
    clientWork: mockExternalClientWork,
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
 * Dark mode variant for dark backgrounds
 */
export const DarkMode: Story = {
  args: {
    nav: mockNav,
    personalWork: mockPersonalWork,
    clientWork: mockClientWork,
    isDark: true,
  },
  render: (args) => (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <div>
        <Header {...args} />
        <main style={{ color: "white" }}>
          <div
            style={{
              maxWidth: "1024px",
              margin: "0 auto",
              padding: "2rem",
            }}
          >
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              Dark Mode Header
            </h1>
            <p style={{ fontSize: "1.25rem", lineHeight: 1.6, opacity: 0.8 }}>
              The header automatically adapts to dark backgrounds with inverted
              colors. The transparent overlay effect creates a seamless
              integration with the content.
            </p>
          </div>
        </main>
      </div>
    </div>
  ),
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
    <div>
      <Header {...args} />
      <main>
        <div
          style={{
            maxWidth: "1024px",
            margin: "0 auto",
            padding: "2rem",
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
            <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: "1rem" }}>
              The header embraces a brutalist aesthetic with decorative ASCII
              characters, creating a unique and memorable navigation experience.
              On desktop, it displays three columns showing navigation links,
              recent personal work, and client projects. On mobile, it
              transforms into a sleek overlay menu.
            </p>
            <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: "1rem" }}>
              The fixed header stays at the top while you scroll, ensuring easy
              access to navigation at all times. This creates a seamless
              browsing experience while maintaining the bold, brutalist
              aesthetic.
            </p>
          </div>

          <div style={{ marginTop: "4rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Features</h2>
            <ul style={{ lineHeight: 2, opacity: 0.8, paddingLeft: "2rem" }}>
              <li>Fixed position header that stays visible while scrolling</li>
              <li>Responsive design with mobile overlay menu</li>
              <li>ASCII art decorations for a brutalist aesthetic</li>
              <li>
                Three-column layout on desktop for navigation and recent work
              </li>
              <li>External link detection with custom cursor</li>
              <li>Smooth transitions and hover effects</li>
            </ul>
          </div>

          <div style={{ marginTop: "4rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Typography
            </h2>
            <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: "1rem" }}>
              The project uses a carefully selected typography system: Impact
              for headlines creating strong visual hierarchy, Arial for body
              text ensuring readability, and Trattatello for accent text adding
              a distinctive personality.
            </p>
            <p style={{ lineHeight: 1.75, opacity: 0.8 }}>
              The base font size is set to 12px, giving the entire design a
              compact, information-dense feel that's characteristic of brutalist
              web design.
            </p>
          </div>

          <div style={{ marginTop: "4rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Scroll to See Fixed Header
            </h2>
            <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: "2rem" }}>
              Keep scrolling to see how the header stays fixed at the top of the
              page. This ensures that navigation is always accessible, no matter
              where you are on the page.
            </p>
            {[...Array(10)].map((_, i) => (
              <p
                key={i}
                style={{
                  lineHeight: 1.75,
                  opacity: 0.6,
                  marginBottom: "1rem",
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            ))}
          </div>

          <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              End of Demo Content
            </h2>
            <p style={{ lineHeight: 1.75, opacity: 0.8 }}>
              You've reached the end! Scroll back up to see the fixed header in
              action. Notice how it stays perfectly positioned at the top,
              providing easy access to navigation at all times.
            </p>
          </div>
        </div>
      </main>
    </div>
  ),
};
