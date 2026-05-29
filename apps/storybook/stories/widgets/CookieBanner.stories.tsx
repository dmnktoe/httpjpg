import { ConsentManagerProvider, useHeadlessConsentUI } from "@httpjpg/consent";
import { CookieBanner } from "@httpjpg/consent/banner";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

/**
 * Drives the real banner into view (and optionally expands it) once mounted.
 * Rendered after <CookieBanner /> so the banner's event listener is attached
 * before we dispatch the "open settings" event.
 */
function BannerController({ expanded = false }: { expanded?: boolean }) {
  const { openBanner } = useHeadlessConsentUI();
  useEffect(() => {
    openBanner({ force: true });
    if (expanded) {
      window.dispatchEvent(new CustomEvent("openCookieSettings"));
    }
  }, [openBanner, expanded]);
  return null;
}

/** The banner portals to <body>, so the theme has to live on <html>, not a wrapper. */
function HtmlTheme({ theme }: { theme: "light" | "dark" }) {
  useEffect(() => {
    const previous = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = theme;
    return () => {
      document.documentElement.dataset.theme = previous ?? "light";
    };
  }, [theme]);
  return null;
}

interface BannerStoryProps {
  expanded?: boolean;
  theme?: "light" | "dark";
}

function BannerStory({ expanded = false, theme = "light" }: BannerStoryProps) {
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        noStyle: true,
        disableAnimation: true,
        consentCategories: ["necessary", "functionality", "measurement", "experience"],
      }}
    >
      <HtmlTheme theme={theme} />
      <CookieBanner />
      <BannerController expanded={expanded} />
    </ConsentManagerProvider>
  );
}

/**
 * The real cookie consent banner from `@httpjpg/consent`, driven by the c15t
 * headless provider. Brutalist styling, fixed to the bottom of the viewport,
 * with per-category toggles and vendor details.
 *
 * Note: the banner renders through a portal to `<body>`, so these stories are
 * not part of autodocs (multiple portaled banners would overlap).
 */
const meta = {
  title: "Widgets/CookieBanner",
  component: BannerStory,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BannerStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default collapsed state — the banner as it first appears to visitors. */
export const Default: Story = {
  args: { expanded: false },
};

/** Expanded state showing all cookie categories with toggles and vendor details. */
export const WithDetails: Story = {
  args: { expanded: true },
};

/** Dark theme variant via the `data-theme="dark"` attribute on the document root. */
export const DarkTheme: Story = {
  args: { expanded: true, theme: "dark" },
};
