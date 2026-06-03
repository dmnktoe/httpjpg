import { StoryblokRichText, type StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";

type RichtextData = StoryblokRichTextProps["data"];
import { Box } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { MOCK_RICHTEXT } from "../shared/storybook-fixtures";

const meta = {
  title: "Typography/Richtext",
  component: StoryblokRichText,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Storyblok WYSIWYG resolver from `@httpjpg/storyblok-richtext`. Renders Tiptap-style " +
          "documents through a tag-handler map, with custom extensions for image copyright and " +
          "inline code. `maxWidth` accepts a boolean (`true` → 65ch), a CSS length, or `false` " +
          "to opt out.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: { type: "select" as const },
      options: Object.keys(MOCK_RICHTEXT),
      mapping: MOCK_RICHTEXT,
      description: "Storyblok richtext document",
    },
    maxWidth: {
      control: { type: "select" as const },
      options: [true, false, "45ch", "65ch", "80ch", "100%"],
      description:
        "`true` → 65ch (default reading width); pass any CSS length, or `false` to remove the constraint",
      table: { defaultValue: { summary: "undefined (no constraint)" } },
    },
    color: {
      control: "color",
      description: "Inline color applied to all inherited text nodes",
    },
  },
} satisfies Meta<typeof StoryblokRichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    data: MOCK_RICHTEXT.article as unknown as RichtextData,
    maxWidth: true,
  },
};

export const Simple: Story = {
  args: {
    data: MOCK_RICHTEXT.simple as unknown as RichtextData,
  },
};

export const WithHeading: Story = {
  args: {
    data: MOCK_RICHTEXT.withHeading as unknown as RichtextData,
  },
};

export const Article65ch: Story = {
  args: {
    data: MOCK_RICHTEXT.article as unknown as RichtextData,
    maxWidth: "65ch",
  },
  parameters: {
    docs: {
      description: {
        story: "Default reading width — lines stay under ~75 characters for comfortable scanning.",
      },
    },
  },
};

export const ArticleNarrow: Story = {
  args: {
    data: MOCK_RICHTEXT.article as unknown as RichtextData,
    maxWidth: "45ch",
  },
  parameters: {
    docs: {
      description: {
        story: "Editorial / book-column width. Useful for narrow sidebars or pull-quotes.",
      },
    },
  },
};

export const ArticleFullWidth: Story = {
  args: {
    data: MOCK_RICHTEXT.article as unknown as RichtextData,
    maxWidth: false,
  },
  parameters: {
    docs: {
      description: {
        story: "`maxWidth={false}` removes the constraint — content fills the container.",
      },
    },
  },
};

export const AccentColor: Story = {
  args: {
    data: MOCK_RICHTEXT.article as unknown as RichtextData,
    maxWidth: "65ch",
    color: "var(--colors-primary-500)",
  },
  render: (args) => (
    <Box css={{ bg: "pageBg", p: "6" }}>
      <StoryblokRichText {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`color` cascades to every text node (paragraphs, headings, list items, links). " +
          "Useful for callout-style richtext blocks on dark backgrounds.",
      },
    },
  },
};

export const EmptyDocument: Story = {
  args: {
    data: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: "Missing `data` renders nothing — safe to use without null-checks upstream.",
      },
    },
  },
};
