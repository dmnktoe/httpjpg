import { Box, PageActions, PageActionsProvider } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

const HREF = "https://example.com";
const EDIT_HREF = "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2";

/**
 * The page's one pill row. `PageActionsProvider` sits in the root layout; work
 * pages publish their live URL + accent through `PageActions`. In draft the row
 * adds draft status · edit · exit · grid (`G` toggles the 12-column overlay).
 */
const meta = {
  title: "Display/PageActions",
  component: PageActions,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 360 },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text", description: "Work page live URL" },
    editHref: {
      control: "text",
      description: "Visual Editor deep-link; only draft content carries one",
    },
    accentColor: { control: "color", description: "Tints the live-URL pill only" },
  },
} satisfies Meta<typeof PageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = ({ children }: { children: ReactNode }) => (
  <Box
    css={{
      position: "relative",
      width: "100%",
      height: "320px",
      backgroundColor: "neutral.100",
      backgroundImage:
        "linear-gradient(45deg, {colors.neutral.200} 25%, transparent 25%), linear-gradient(-45deg, {colors.neutral.200} 25%, transparent 25%)",
      backgroundSize: "24px 24px",
      backgroundPosition: "0 0, 0 12px",
    }}
  >
    {children}
  </Box>
);

/** Published work page. */
export const WorkPreview: Story = {
  args: { href: HREF, accentColor: "#EC6839" },
  render: (args) => (
    <Stage>
      <PageActionsProvider>
        <PageActions {...args} />
      </PageActionsProvider>
    </Stage>
  ),
};

/** Draft work page: accented live URL + draft tools on the default glass. */
export const DraftWorkPage: Story = {
  args: { href: HREF, editHref: EDIT_HREF, accentColor: "#EC6839" },
  render: (args) => (
    <Stage>
      <PageActionsProvider draft>
        <PageActions {...args} />
      </PageActionsProvider>
    </Stage>
  ),
};

/** Draft Mode on a page without a story (e.g. cookie policy): status, exit, grid. */
export const DraftOnly: Story = {
  render: () => (
    <Stage>
      <PageActionsProvider draft />
    </Stage>
  ),
};

/** Inside the Visual Editor iframe: no edit link, no exit. */
export const InVisualEditor: Story = {
  args: { editHref: EDIT_HREF },
  render: (args) => (
    <Stage>
      <PageActionsProvider draft inEditor>
        <PageActions {...args} />
      </PageActionsProvider>
    </Stage>
  ),
};
