import { Header, ImagePreview } from "@httpjpg/ui";
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

const mockPersonalWorkWithImages = [
  {
    id: "1",
    slug: "brutalist-portfolio",
    title: "Brutalist Portfolio 2024",
    imageUrl:
      "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/600x400/smart/filters:quality(75)",
  },
  {
    id: "2",
    slug: "design-system",
    title: "httpjpg Design System",
    imageUrl:
      "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/600x400/smart/filters:quality(75)",
  },
  {
    id: "3",
    slug: "experimental-ui",
    title: "Experimental UI Kit",
    imageUrl:
      "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/600x400/smart/filters:quality(75)",
  },
  {
    id: "4",
    slug: "ascii-art-generator",
    title: "ASCII Art Generator",
    imageUrl:
      "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/600x400/smart/filters:quality(75)",
  },
];

const mockClientWorkWithImages = [
  {
    id: "1",
    slug: "client-project-1",
    title: "Client Alpha - Branding",
    imageUrl:
      "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/600x400/smart/filters:quality(75)",
  },
  {
    id: "2",
    slug: "client-project-2",
    title: "Client Beta - Web Design",
    imageUrl:
      "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/600x400/smart/filters:quality(75)",
  },
  {
    id: "3",
    slug: "client-project-3",
    title: "Client Gamma - App Dev",
    imageUrl:
      "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/600x400/smart/filters:quality(75)",
  },
];

/**
 * Header with image preview on work items
 * Hover over work items in the navigation to see featured images
 * Note: Add ImagePreview component to your root layout to enable this feature
 */
export const WithImagePreview: Story = {
  args: {
    nav: mockNav,
    personalWork: mockPersonalWorkWithImages,
    clientWork: mockClientWorkWithImages,
  },
  render: (args) => (
    <div>
      <ImagePreview />
      <Header {...args} />
      <div
        style={{
          padding: "6rem 2rem 2rem",
          minHeight: "100vh",
          background: "white",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "1.5rem",
              fontFamily: "Impact, sans-serif",
            }}
          >
            HOVER OVER WORK ITEMS
          </h1>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.6, opacity: 0.8 }}>
            Open the header menu and hover over the work items in the
            "Personal/Things" and "Client Work" sections to see the featured
            image preview following your cursor. This creates an engaging
            preview experience for portfolio navigation.
          </p>

          <div style={{ marginTop: "3rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Image Preview Feature
            </h2>
            <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: "1rem" }}>
              The header uses the ImagePreview component which is independent
              from cursor styling. When a work item has an imageUrl property,
              hovering over the link displays a 300x200px preview image that
              follows your cursor.
            </p>
            <p style={{ lineHeight: 1.75, opacity: 0.8 }}>
              This provides an immediate visual preview of the project without
              requiring navigation, creating a more interactive and engaging
              browsing experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
