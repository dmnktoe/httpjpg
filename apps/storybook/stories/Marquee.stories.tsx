import { Box, Marquee } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Marquee component stories
 *
 * Infinite scrolling text component for announcements,
 * ASCII art, and brutalist navigation elements.
 */
const meta = {
  title: "Animation & Effects/Marquee",
  component: Marquee,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    speed: {
      control: { type: "range", min: 5, max: 60, step: 5 },
      description: "Animation speed in seconds (lower = faster)",
      table: {
        defaultValue: { summary: "20" },
      },
    },
    direction: {
      control: "select",
      options: ["left", "right"],
      description: "Scroll direction",
      table: {
        defaultValue: { summary: "left" },
      },
    },
    pauseOnHover: {
      control: "boolean",
      description: "Pause animation on hover",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    repeat: {
      control: { type: "range", min: 2, max: 5, step: 1 },
      description: "Number of times to repeat content",
      table: {
        defaultValue: { summary: "3" },
      },
    },
    iosStyle: {
      control: "boolean",
      description: "iOS-style pause at beginning before scrolling",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    pauseDuration: {
      control: { type: "range", min: 1, max: 5, step: 0.5 },
      description: "Pause duration at beginning (in seconds)",
      table: {
        defaultValue: { summary: "2" },
      },
    },
  },
} satisfies Meta<typeof Marquee>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default marquee with ASCII text
 */
export const Default: Story = {
  args: {
    children:
      "⋆.˚ ᡣ𐭩 .𖥔˚ WELCOME TO HTTPJPG ⋆.˚✮🎧✮˚.⋆ — hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘ &&& ——— յׁׅ℘ᧁׁ! :))))) —",
    speed: 20,
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "white" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Fast scrolling announcement
 */
export const FastAnnouncement: Story = {
  args: {
    children: "🎀 ⋆ﾟ･ NEW WORK AVAILABLE ⋆ﾟ･ 🎀 ⋆ﾟ･ CONTACT ME ⋆ﾟ･ 🎀",
    speed: 10,
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "black", color: "white" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Slow ASCII art
 */
export const SlowASCII: Story = {
  args: {
    children:
      "꒰ა ♡ ໒꒱ ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ———— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ &&& ——— ꀭꉣꁅ! ･ﾟ⋆ 🎀",
    speed: 30,
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "neutral.50", fontSize: "lg" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Scrolling right direction
 */
export const RightDirection: Story = {
  args: {
    children: "← SCROLLING RIGHT ← BRUTALIST DESIGN ← HTTPJPG ←",
    speed: 15,
    direction: "right",
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "primary.50" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Pause on hover
 */
export const PauseOnHover: Story = {
  args: {
    children: "⊹ HOVER TO PAUSE ⊹ INTERACTIVE MARQUEE ⊹",
    speed: 15,
    pauseOnHover: true,
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "accent.50" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Navigation style (like header)
 */
export const NavigationStyle: Story = {
  args: {
    children: "",
  },
  render: () => (
    <Box css={{ py: "16px", bg: "white", borderBottom: "2px solid black" }}>
      <Marquee speed={25}>
        <span style={{ fontWeight: "bold" }}>⇝HE𝓁𝓁O www.httpjpg.com</span>
        &ensp;꒰ა ♡ ໒꒱&ensp;
        <span style={{ fontFamily: "monospace" }}>
          ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ——— ꠹ρᧁ! :)))))
        </span>
        &ensp;🎀 ⋆ﾟ･&ensp;
        <span>⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆</span>
        &ensp;୨୧ꔛꗃ!&ensp;
      </Marquee>
    </Box>
  ),
};

/**
 * Multiple stacked marquees
 */
export const StackedMarquees: Story = {
  args: {
    children: "",
  },
  render: () => (
    <Box>
      <Marquee speed={15} css={{ py: "12px", borderBottom: "2px solid black" }}>
        ✦ ◆ ✧ ◇ ⬥ ⬦ HTTPJPG ✦ ◆ ✧ ◇ ⬥ ⬦
      </Marquee>
      <Marquee
        speed={20}
        direction="right"
        css={{ py: "12px", borderBottom: "2px solid black", bg: "neutral.50" }}
      >
        🎀 PORTFOLIO 2024 🎀 BRUTALIST DESIGN 🎀
      </Marquee>
      <Marquee speed={25} css={{ py: "12px", bg: "black", color: "white" }}>
        ⋆.˚ ᡣ𐭩 .𖥔˚ NEW WORK AVAILABLE ⋆.˚✮🎧✮˚.⋆
      </Marquee>
    </Box>
  ),
};

/**
 * Large text marquee
 */
export const LargeText: Story = {
  args: {
    children: "BRUTALIST ✦ DESIGN ◆ SYSTEM ✧",
    speed: 12,
  },
  decorators: [
    (Story) => (
      <Box
        css={{
          p: "48px",
          bg: "black",
          color: "white",
          fontSize: "4xl",
          fontWeight: "bold",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * Glitch style with mono font
 */
export const GlitchStyle: Story = {
  args: {
    children: "P̵̨̢͇L̴͙̝͎Ë̴́̔̈Ä̴́S̶̡̰̪̭E̴̢̢̛ ̸̡̛̣Y̴͎̘̙Ơ̴̼̻Ü̷̟̤͙S̸̩͔E̵̡̺̘ ̷̪͔T̷̯̹H̷͎̣̦E̷͈͕̗ ̵͖̥̥N̸̼̪̘A̵̧̪̱W̴̙͑I̷̥͓̱G̶͔̠̣A̷͚̋T̴̨̰̭I̵̡͓̖O̴͖͇͈N̷̝̺̺",
    speed: 18,
  },
  decorators: [
    (Story) => (
      <Box css={{ p: "32px", bg: "white", fontFamily: "mono" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * iOS-style with pause at beginning
 */
export const IOSStyle: Story = {
  args: {
    children: "✦ NOW PLAYING: BRUTALIST DESIGN SYSTEM ◆ HTTPJPG ✧",
    speed: 8,
    iosStyle: true,
    pauseDuration: 2,
    repeat: 2,
  },
  decorators: [
    (Story) => (
      <Box
        css={{
          p: "16px",
          bg: "neutral.900",
          color: "white",
          fontSize: "sm",
          maxW: "400px",
          mx: "auto",
          borderRadius: "8px",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * iOS music player style
 */
export const MusicPlayer: Story = {
  args: {
    children: "🎵 Arctic Monkeys — Do I Wanna Know? — AM (2013)",
    speed: 10,
    iosStyle: true,
    pauseDuration: 3,
    repeat: 2,
  },
  decorators: [
    (Story) => (
      <Box
        css={{
          p: "24px",
          bg: "white",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "12px",
          maxW: "320px",
          mx: "auto",
        }}
      >
        <Box css={{ fontSize: "xs", color: "neutral.500", mb: "8px" }}>
          NOW PLAYING
        </Box>
        <Story />
      </Box>
    ),
  ],
};
