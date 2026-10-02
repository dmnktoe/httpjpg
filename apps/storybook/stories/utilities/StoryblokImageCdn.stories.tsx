import { getResponsiveImage, imagePreset } from "@httpjpg/storyblok-utils";
import { Box, CodeBlock, Headline, Paragraph, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { MOCK_IMAGES } from "../shared/storybook-fixtures";

interface PlaygroundArgs {
  imageSrc: string;
  aspectRatio: string;
  focus: string;
  filters: string;
}

function Playground(_args: PlaygroundArgs) {
  return null;
}

const meta = {
  title: "Utilities/Storyblok Image CDN",
  component: Playground,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Interactive playground for the Storyblok image-service helpers from `@httpjpg/storyblok-utils`. " +
          "`getResponsiveImage` produces a `srcSet` across width breakpoints; `imagePreset` wraps three " +
          "canonical transforms (og, thumb, blur). External (non-Storyblok) URLs pass through unchanged.",
      },
    },
  },
  argTypes: {
    imageSrc: {
      control: { type: "select" as const },
      options: Object.keys(MOCK_IMAGES),
      mapping: MOCK_IMAGES,
      description: "Source filename (Storyblok asset URL)",
    },
    aspectRatio: {
      control: { type: "select" as const },
      options: ["auto", "16/9", "4/3", "1/1", "3/4", "9/16", "21/9"],
      description: "Optional crop ratio (omitted when `auto`)",
      table: { defaultValue: { summary: "auto" } },
    },
    focus: {
      control: "text",
      description: "Focal point `x:y` for smart cropping (e.g. `400x300:600x500`)",
    },
    filters: {
      control: { type: "select" as const },
      options: ["", "format(webp)", "grayscale()", "blur(5)", "brightness(20)"],
      description: "Storyblok filter chain (chain with `:` for multiple)",
    },
  },
} satisfies Meta<typeof Playground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsivePlayground: Story = {
  args: {
    imageSrc: MOCK_IMAGES.videoStill1,
    aspectRatio: "16/9",
    focus: "",
    filters: "",
  },
  render: (args: PlaygroundArgs) => {
    const { src, srcSet } = getResponsiveImage(args.imageSrc, {
      aspectRatio: args.aspectRatio === "auto" ? undefined : args.aspectRatio,
      focus: args.focus || undefined,
      filters: args.filters || undefined,
    });

    return (
      <Stack direction="vertical" gap="6">
        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ Rendered
          </Headline>
          <Paragraph size="sm" color="muted" css={{ mb: "3" }}>
            Browser picks the closest match from `srcSet` based on viewport + DPR.
          </Paragraph>
          <Box css={{ maxW: "640px", border: "2px solid", borderColor: "pageFg" }}>
            <img
              src={src}
              srcSet={srcSet}
              sizes="(min-width: 640px) 640px, 100vw"
              alt="Storyblok CDN preview"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </Box>
        </Box>

        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ Generated `src`
          </Headline>
          <CodeBlock code={src || "(empty)"} language="text" filename="src" copyable={false} />
        </Box>

        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ Generated `srcSet`
          </Headline>
          <CodeBlock
            code={srcSet.split(", ").join(",\n") || "(empty — non-Storyblok URL)"}
            language="text"
            filename="srcSet"
            copyable={false}
          />
        </Box>
      </Stack>
    );
  },
};

export const Presets: Story = {
  args: {
    imageSrc: MOCK_IMAGES.landscape,
    aspectRatio: "auto",
    focus: "",
    filters: "",
  },
  render: (args: PlaygroundArgs) => {
    const og = imagePreset.og(args.imageSrc, args.focus || undefined);
    const thumb = imagePreset.thumb(args.imageSrc, args.focus || undefined);
    const blur = imagePreset.blur(args.imageSrc, args.focus || undefined);

    return (
      <Stack direction="vertical" gap="8">
        <Paragraph size="sm" color="muted" css={{ maxW: "55ch" }}>
          The three canonical presets centralise the magic strings (`1200x630/smart`, `200x0`,
          `20x0`) used across OG tags, navigation thumbnails, and blur-up placeholders.
        </Paragraph>

        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ og (1200×630 smart-crop)
          </Headline>
          <Box css={{ maxW: "600px", mb: "3", border: "2px solid", borderColor: "pageFg" }}>
            <img
              src={og}
              alt="og preset"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </Box>
          <CodeBlock code={og} language="text" filename="og url" copyable={false} />
        </Box>

        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ thumb (200px wide)
          </Headline>
          <Box
            css={{ display: "inline-block", mb: "3", border: "2px solid", borderColor: "pageFg" }}
          >
            <img src={thumb} alt="thumb preset" style={{ display: "block", height: "auto" }} />
          </Box>
          <CodeBlock code={thumb} language="text" filename="thumb url" copyable={false} />
        </Box>

        <Box>
          <Headline level={3} css={{ mb: "2" }}>
            ◇ blur (20px low-res placeholder)
          </Headline>
          <Box
            css={{ display: "inline-block", mb: "3", border: "2px solid", borderColor: "pageFg" }}
          >
            <img
              src={blur}
              alt="blur preset"
              style={{ display: "block", width: "200px", height: "auto", filter: "blur(8px)" }}
            />
          </Box>
          <CodeBlock code={blur} language="text" filename="blur url" copyable={false} />
        </Box>
      </Stack>
    );
  },
};

export const ExternalPassthrough: Story = {
  args: {
    imageSrc: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    aspectRatio: "auto",
    focus: "",
    filters: "",
  },
  render: (args: PlaygroundArgs) => {
    const { src, srcSet } = getResponsiveImage(args.imageSrc);

    return (
      <Stack direction="vertical" gap="4">
        <Paragraph size="sm" color="muted" css={{ maxW: "55ch" }}>
          Non-Storyblok URLs pass through unchanged: `src` matches input, `srcSet` is empty. The
          image service is Storyblok-only.
        </Paragraph>
        <Box css={{ maxW: "400px", border: "2px solid", borderColor: "pageFg" }}>
          <img
            src={src}
            alt="external"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </Box>
        <CodeBlock
          code={`src:    ${src}\nsrcSet: ${srcSet || "(empty)"}`}
          language="text"
          copyable={false}
        />
      </Stack>
    );
  },
};
