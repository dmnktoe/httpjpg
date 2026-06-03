import { clearConsent, CookieBanner } from "@httpjpg/consent";
import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

const meta = {
  title: "Widgets/CookieBanner",
  component: CookieBanner,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof CookieBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

interface CookieBannerDemoProps {
  openSettings?: boolean;
}

function CookieBannerDemo({ openSettings = false }: CookieBannerDemoProps) {
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
        so you can try them all.
      </Paragraph>
      <CookieBanner
        key={instance}
        onAcceptAll={rearm}
        onRejectAll={rearm}
        onSavePreferences={rearm}
      />
    </Box>
  );
}

export const Default: Story = {
  render: () => <CookieBannerDemo />,
};

export const Preferences: Story = {
  render: () => <CookieBannerDemo openSettings />,
};
