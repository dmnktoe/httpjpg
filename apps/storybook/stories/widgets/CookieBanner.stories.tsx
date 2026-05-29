import { ConsentManagerProvider, useHeadlessConsentUI } from "@httpjpg/consent";
import { CookieBanner } from "@httpjpg/consent/banner";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

// Mounted after <CookieBanner /> so its openCookieSettings listener exists before we dispatch.
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

// The banner portals to <body>, so the theme must live on <html>, not a wrapper.
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

const meta = {
  title: "Widgets/CookieBanner",
  component: BannerStory,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BannerStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { expanded: false },
};

export const WithDetails: Story = {
  args: { expanded: true },
};

export const DarkTheme: Story = {
  args: { expanded: true, theme: "dark" },
};
