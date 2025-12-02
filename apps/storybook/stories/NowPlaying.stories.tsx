import type { NowPlayingProps } from "@httpjpg/now-playing";
import { NowPlaying } from "@httpjpg/now-playing";
import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * NowPlaying component stories
 *
 * Draggable floating widget with Spotify-inspired glassmorphism design.
 * Features crisp album artwork and iOS-style marquee for long text.
 */
const meta = {
  title: "Components/NowPlaying",
  component: NowPlaying,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Song title",
    },
    artist: {
      control: "text",
      description: "Artist name",
    },
    artwork: {
      control: "text",
      description: "Album artwork URL",
    },
    isPlaying: {
      control: "boolean",
      description: "Playing state indicator",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Widget size",
    },
  },
} satisfies Meta<typeof NowPlaying>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Now Playing widget
 */
export const Default: Story = {
  args: {
    title: "Blinding Lights",
    artist: "The Weeknd",
    artwork: "https://picsum.photos/400/400?random=1",
    isPlaying: true,
    size: "sm",
  },
};

/**
 * Long title with marquee
 */
export const LongTitle: Story = {
  args: {
    title: "Bohemian Rhapsody (Remastered 2011)",
    artist: "Queen",
    artwork: "https://picsum.photos/400/400?random=2",
    isPlaying: true,
    size: "sm",
  },
};

/**
 * Very long artist name
 */
export const LongArtist: Story = {
  args: {
    title: "One More Time",
    artist: "Daft Punk feat. Romanthony & DJ Sneak",
    artwork: "https://picsum.photos/400/400?random=3",
    isPlaying: true,
    size: "sm",
  },
};

/**
 * Both title and artist long
 */
export const BothLong: Story = {
  args: {
    title: "Echoes (Live at Pompeii 1971 - Remastered)",
    artist: "Pink Floyd with the Royal Philharmonic Orchestra",
    artwork: "https://picsum.photos/400/400?random=4",
    isPlaying: true,
    size: "sm",
  },
};

/**
 * Paused state (no playing indicator)
 */
export const Paused: Story = {
  args: {
    title: "Midnight City",
    artist: "M83",
    artwork: "https://picsum.photos/400/400?random=5",
    isPlaying: false,
    size: "sm",
  },
};

/**
 * Loading state
 * Shows a draggable loading widget with skeleton animation while fetching data
 */
export const Loading: Story = {
  args: {
    title: "Loading...",
    artist: "...",
    artwork:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E",
    isPlaying: false,
    isLoading: true,
    textColor: "white",
  },
};

/**
 * Nothing Playing
 * Shows empty state when no track is playing
 */
export const NothingPlaying: Story = {
  args: {
    title: "╱╱ Nothing playing ╱╱",
    artist: "⋄ ⋄ ⋄",
    artwork:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E",
    isPlaying: false,
    vibrantColor: "rgba(163, 163, 163, 0.6)",
    textColor: "white",
    size: "sm",
  },
};

/**
 * Error State
 * Shows error badge when something goes wrong
 */
export const ErrorState = {
  render: () => (
    <>
      <NowPlaying
        title="Error Loading Track"
        artist="Failed to fetch data"
        artwork="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ef4444' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='50' text-anchor='middle' dy='.3em' fill='white'%3E⚠%3C/text%3E%3C/svg%3E"
        isPlaying={false}
        autoExtractColor={false}
        vibrantColor="rgba(239, 68, 68, 0.9)"
        textColor="white"
      />
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "1rem 1.5rem",
          background: "rgba(239, 68, 68, 0.95)",
          color: "white",
          fontFamily: "monospace",
          fontSize: "13px",
          fontWeight: 600,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>⚠️</span>
        <span>Failed to connect to Spotify API</span>
      </div>
    </>
  ),
};

/**
 * Portfolio demo context
 */
export const PortfolioContext: Story = {
  args: {
    title: "Currently Coding To This",
    artist: "Lo-Fi Hip Hop Beats",
    artwork: "https://picsum.photos/400/400?random=11",
    isPlaying: true,
    size: "sm",
  },
  render: (args: NowPlayingProps) => (
    <Box css={{ minH: "100vh", bg: "black", color: "white", p: "8" }}>
      <Box css={{ maxW: "6xl", mx: "auto" }}>
        <Box css={{ mb: "16" }}>
          <Headline level={1} css={{ fontSize: "6xl", mb: "4" }}>
            MY PORTFOLIO
          </Headline>
          <Paragraph size="lg" css={{ opacity: 0.7 }}>
            Creative developer & designer based in Berlin
          </Paragraph>
        </Box>

        <Box
          css={{
            display: "grid",
            gap: "8",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              css={{
                bg: "neutral.900",
                p: "6",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "neutral.800",
              }}
            >
              <Headline level={3} css={{ mb: "2" }}>
                Project {i}
              </Headline>
              <Paragraph css={{ opacity: 0.7 }}>
                A showcase of creative work with brutalist design principles
              </Paragraph>
            </Box>
          ))}
        </Box>
      </Box>
      <NowPlaying {...args} />
    </Box>
  ),
};

/**
 * Playground with all controls
 */
export const Playground: Story = {
  args: {
    title: "Your Favorite Song",
    artist: "Your Favorite Artist",
    artwork: "https://picsum.photos/400/400?random=13",
    isPlaying: true,
    size: "sm",
  },
};
