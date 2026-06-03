import { clearConsent, CookieBanner } from "@httpjpg/consent";
import type { ConsentState } from "@httpjpg/consent";
import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";

const meta = {
  title: "Widgets/CookieBanner",
  component: CookieBanner,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    onAcceptAll: fn(),
    onRejectAll: fn(),
    onSavePreferences: fn(),
  },
} satisfies Meta<typeof CookieBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

interface CookieBannerDemoProps {
  openSettings?: boolean;
  onAcceptAll?: (consent: ConsentState) => void;
  onRejectAll?: () => void;
  onSavePreferences?: (consent: ConsentState) => void;
}

function CookieBannerDemo({
  openSettings = false,
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
}: CookieBannerDemoProps) {
  const [instance, setInstance] = useState(0);

  useEffect(() => {
    clearConsent();
    setInstance((n) => n + 1);
  }, []);

  useEffect(() => {
    if (openSettings && instance > 0) {
      window.dispatchEvent(new Event("openCookieSettings"));
    }
  }, [openSettings, instance]);

  const rearm = () => {
    clearConsent();
    setInstance((n) => n + 1);
  };

  return (
    <Box css={{ minHeight: "60vh", p: { base: "5", md: "10" } }}>
      <Headline level={2}>Cookie banner</Headline>
      <Paragraph spacing>
        Interact with the banner pinned to the bottom of the viewport. It re-arms after each action
        so you can try them all — calls are logged in the Actions panel.
      </Paragraph>
      <CookieBanner
        key={instance}
        onAcceptAll={(consent) => {
          onAcceptAll?.(consent);
          rearm();
        }}
        onRejectAll={() => {
          onRejectAll?.();
          rearm();
        }}
        onSavePreferences={(consent) => {
          onSavePreferences?.(consent);
          rearm();
        }}
      />
    </Box>
  );
}

export const Default: Story = {
  render: (args) => <CookieBannerDemo {...args} />,
};

export const Preferences: Story = {
  render: (args) => <CookieBannerDemo {...args} openSettings />,
};
