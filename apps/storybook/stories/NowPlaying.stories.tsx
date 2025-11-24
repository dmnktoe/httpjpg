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

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <Box css={{ minH: "100vh", bg: "neutral.50", p: "8" }}>
    <Box css={{ maxW: "4xl", mx: "auto" }}>
      <Headline level={1} css={{ mb: "4" }}>
        DRAG THE NOW PLAYING WIDGET
      </Headline>
      <Paragraph size="lg" css={{ mb: "8" }}>
        Click and drag the floating widget anywhere on the screen. Notice the
        smooth animations and marquee effect on long text.
      </Paragraph>
      <Box css={{ bg: "white", p: "8", borderRadius: "lg", shadow: "sm" }}>
        <Paragraph css={{ mb: "4" }}>
          This is some example content. The Now Playing widget floats above
          everything and can be positioned wherever you want.
        </Paragraph>
        <Paragraph>
          Try dragging it around and watch how it follows your cursor with a
          subtle scale effect. The glassmorphism background creates depth while
          keeping the album artwork crisp and clear.
        </Paragraph>
      </Box>
    </Box>
    {children}
  </Box>
);

/**
 * Default Now Playing widget
 */
export const Default: Story = {
  args: {
    title: "Blinding Lights",
    artist: "The Weeknd",
    artwork: "https://picsum.photos/400/400?random=1",
    isPlaying: true,
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    title: "Levitating",
    artist: "Dua Lipa",
    artwork: "https://picsum.photos/400/400?random=6",
    isPlaying: true,
    initialPosition: { x: 20, y: 20 },
    size: "sm",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    artwork: "https://picsum.photos/400/400?random=7",
    isPlaying: true,
    initialPosition: { x: 20, y: 20 },
    size: "lg",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
};

/**
 * Multiple widgets at once
 */
export const MultipleWidgets: Story = {
  args: {
    title: "Multiple Widgets Demo",
    artist: "Various Artists",
    artwork: "https://picsum.photos/400/400?random=14",
    isPlaying: true,
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: () => (
    <PageLayout>
      <NowPlaying
        title="Blinding Lights"
        artist="The Weeknd"
        artwork="https://picsum.photos/400/400?random=8"
        isPlaying={true}
        initialPosition={{ x: 20, y: 20 }}
        size="sm"
      />
      <NowPlaying
        title="Bohemian Rhapsody"
        artist="Queen"
        artwork="https://picsum.photos/400/400?random=9"
        isPlaying={true}
        initialPosition={{ x: 20, y: 100 }}
        size="md"
      />
      <NowPlaying
        title="One More Time"
        artist="Daft Punk"
        artwork="https://picsum.photos/400/400?random=10"
        isPlaying={true}
        initialPosition={{ x: 20, y: 190 }}
        size="lg"
      />
    </PageLayout>
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
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
    initialPosition: { x: 20, y: 20 },
    size: "md",
  },
  render: (args: NowPlayingProps) => (
    <PageLayout>
      <NowPlaying {...args} />
    </PageLayout>
  ),
};
