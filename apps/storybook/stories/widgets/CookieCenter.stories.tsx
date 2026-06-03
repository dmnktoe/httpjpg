import { clearConsent, CookieCenter, setConsent } from "@httpjpg/consent";
import type { ConsentState } from "@httpjpg/consent";
import { Box, Container, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";

const meta = {
  title: "Widgets/CookieCenter",
  component: CookieCenter,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    onSave: fn(),
  },
} satisfies Meta<typeof CookieCenter>;

export default meta;

type Story = StoryObj<typeof meta>;

interface CookieCenterDemoProps {
  seed?: ConsentState;
  onSave?: (consent: ConsentState) => void;
}

function CookieCenterDemo({ seed, onSave }: CookieCenterDemoProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    clearConsent();
    if (seed) {
      setConsent(seed);
    }
    setIsReady(true);
  }, [seed]);

  if (!isReady) {
    return null;
  }

  return (
    <Container size="md">
      <Headline level={2}>Cookie center</Headline>
      <Paragraph spacing>
        The inline preference manager embedded on the Cookie Policy page. Choices persist to the
        consent cookie and take effect immediately — saves are logged in the Actions panel.
      </Paragraph>
      <Box css={{ mt: "4" }}>
        <CookieCenter onSave={onSave} />
      </Box>
    </Container>
  );
}

export const Default: Story = {
  render: (args) => <CookieCenterDemo {...args} />,
};

export const PreviouslyConsented: Story = {
  render: (args) => (
    <CookieCenterDemo
      {...args}
      seed={{ analytics: true, monitoring: true, preferences: true, media: false }}
    />
  ),
};
