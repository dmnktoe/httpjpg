import { clearConsent, CookieBanner } from "@httpjpg/consent";
import type { ConsentState } from "@httpjpg/consent";
import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

/**
 * Cookie consent banner stories.
 *
 * The banner portals itself to `document.body` and only renders while no
 * consent cookie is set, so each story clears the saved consent on mount and
 * re-arms the banner after every action — keeping it interactive in the canvas.
 */
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
  // Bump on mount and after every action so the banner re-mounts with a clean slate.
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
        Interact with the banner pinned to the bottom of the viewport. Accept, reject, or customize
        — it re-arms after each action so you can try them all.
      </Paragraph>
      <CookieBanner
        key={instance}
        onAcceptAll={(consent: ConsentState) => {
          console.warn("onAcceptAll", consent);
          rearm();
        }}
        onRejectAll={() => {
          console.warn("onRejectAll");
          rearm();
        }}
        onSavePreferences={(consent: ConsentState) => {
          console.warn("onSavePreferences", consent);
          rearm();
        }}
      />
    </Box>
  );
}

export const Default: Story = {
  render: () => <CookieBannerDemo />,
};

/** Opens straight into the expanded preferences panel via the `openCookieSettings` event. */
export const Preferences: Story = {
  render: () => <CookieBannerDemo openSettings />,
};
