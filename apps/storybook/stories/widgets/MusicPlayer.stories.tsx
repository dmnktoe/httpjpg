import { MusicPlayer } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Spotify, SoundCloud, or a local MP3. MP3 mode uses the site audio engine
 * when an `AudioPlayerProvider` is mounted.
 */
const meta: Meta<typeof MusicPlayer> = {
  title: "Widgets/MusicPlayer",
  component: MusicPlayer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    source: {
      control: "select",
      options: ["mp3", "spotify", "soundcloud"] as const,
      description: "Music source type",
      table: { defaultValue: { summary: "mp3" } },
    },
    src: { control: "text", description: "Source URL or Spotify URI" },
    title: { control: "text", description: "Track title (MP3 display)" },
    artist: { control: "text", description: "Artist name (MP3 display)" },
    artwork: { control: "text", description: "Artwork URL (MP3 display)" },
    spotifySize: {
      control: "select",
      options: ["compact", "normal"] as const,
      description: "Spotify embed size",
      table: { defaultValue: { summary: "normal" } },
    },
    showArtwork: {
      control: "boolean",
      description: "Show album artwork",
      table: { defaultValue: { summary: "true" } },
    },
    showInfo: {
      control: "boolean",
      description: "Show track info",
      table: { defaultValue: { summary: "true" } },
    },
    autoPlay: {
      control: "boolean",
      description: "Auto play audio",
      table: { defaultValue: { summary: "false" } },
    },
    decoration: {
      control: "text",
      description: "ASCII decoration pattern shown around the player",
      table: { defaultValue: { summary: "ASCII_DIVIDER_MUSIC" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MusicPlayer>;

export const SpotifyTrack: Story = {
  args: {
    source: "spotify",
    src: "spotify:track:4VAwmUsWjEgK6yAkv2epvG",
    spotifySize: "compact",
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
};

export const SpotifyTrackFull: Story = {
  args: {
    source: "spotify",
    src: "spotify:track:4VAwmUsWjEgK6yAkv2epvG",
    spotifySize: "normal",
    decoration: "⋆.˚ ᡣ𐭩 .𖥔˚ MUSIC ⋆.˚✮",
  },
};

export const SpotifyAlbum: Story = {
  args: {
    source: "spotify",
    src: "spotify:album:1DFixLWuPkv3KT3TnV35m3",
    spotifySize: "normal",
    decoration: "✧･ﾟ: *✧･ﾟ:* ALBUM *:･ﾟ✧*:･ﾟ✧",
  },
};

export const SoundCloudTrack: Story = {
  args: {
    source: "soundcloud",
    src: "https://soundcloud.com/te3shay/u-got-swag-forget-the-rest",
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
};

export const MP3Player: Story = {
  args: {
    source: "mp3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Example Track",
    artist: "Example Artist",
    artwork: "https://via.placeholder.com/300x300/ff5500/ffffff?text=Album+Art",
    showArtwork: true,
    showInfo: true,
    autoPlay: false,
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
};

/**
 * MP3 without artwork — controls and metadata only.
 */
export const MinimalMP3: Story = {
  args: {
    source: "mp3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Example Track",
    artist: "Example Artist",
    showArtwork: false,
    showInfo: true,
    autoPlay: false,
    decoration: "・゜゜・。。・゜゜・。",
  },
};

export const ControlsOnly: Story = {
  args: {
    source: "mp3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    showArtwork: false,
    showInfo: false,
    autoPlay: false,
    decoration: "⋄ ⋄ ⋄",
  },
};

export const CustomDecoration: Story = {
  args: {
    source: "mp3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Example Track",
    artist: "Example Artist",
    artwork: "https://via.placeholder.com/300x300/ff5500/ffffff?text=Album+Art",
    showArtwork: true,
    showInfo: true,
    autoPlay: false,
    decoration: "⋆.˚ ✮ ᡣ𐭩 .𖥔˚ VIBES ⋆.˚✮✮˚.⋆",
  },
};

export const WithHeaderFooter: Story = {
  args: {
    source: "mp3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Example Track",
    artist: "Example Artist",
    artwork: "https://via.placeholder.com/300x300/ff5500/ffffff?text=Album+Art",
    showArtwork: true,
    showInfo: true,
    autoPlay: false,
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
  render: (args) => (
    <MusicPlayer
      {...args}
      headerContent={<div>🎵 NOW PLAYING ･ﾟ⋆</div>}
      footerContent={<div>Released 2025</div>}
    />
  ),
};
