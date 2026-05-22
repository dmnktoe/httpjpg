import { MusicPlayer } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

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
      options: ["mp3", "spotify", "soundcloud", "custom"],
      description: "Music source type",
    },
    src: {
      control: "text",
      description: "Source URL or ID",
    },
    title: {
      control: "text",
      description: "Track title (for MP3 display)",
    },
    artist: {
      control: "text",
      description: "Artist name (for MP3 display)",
    },
    spotifySize: {
      control: "select",
      options: ["compact", "normal"],
      description: "Spotify embed size",
    },
    showArtwork: {
      control: "boolean",
      description: "Show album artwork",
    },
    showInfo: {
      control: "boolean",
      description: "Show track info",
    },
    autoPlay: {
      control: "boolean",
      description: "Auto play audio",
    },
    decoration: {
      control: "text",
      description: "ASCII decoration pattern",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MusicPlayer>;

/**
 * Spotify track embed (compact size)
 *
 * Embeds a Spotify track player with ASCII decorations.
 * The compact player is smaller and perfect for minimal layouts.
 */
export const SpotifyTrack: Story = {
  args: {
    source: "spotify",
    src: "spotify:track:4VAwmUsWjEgK6yAkv2epvG",
    spotifySize: "compact",
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
};

/**
 * Spotify track embed (normal size)
 *
 * Embeds a Spotify track player with full size display.
 */
export const SpotifyTrackFull: Story = {
  args: {
    source: "spotify",
    src: "spotify:track:4VAwmUsWjEgK6yAkv2epvG",
    spotifySize: "normal",
    decoration: "⋆.˚ ᡣ𐭩 .𖥔˚ MUSIC ⋆.˚✮",
  },
};

/**
 * Spotify album embed
 *
 * Embeds an entire Spotify album with track list.
 */
export const SpotifyAlbum: Story = {
  args: {
    source: "spotify",
    src: "spotify:album:1DFixLWuPkv3KT3TnV35m3",
    spotifySize: "normal",
    decoration: "✧･ﾟ: *✧･ﾟ:* ALBUM *:･ﾟ✧*:･ﾟ✧",
  },
};

/**
 * SoundCloud embed
 *
 * Embeds a SoundCloud track with ASCII decorations.
 */
export const SoundCloudTrack: Story = {
  args: {
    source: "soundcloud",
    src: "https://soundcloud.com/te3shay/u-got-swag-forget-the-rest",
    decoration: "･ﾟ⋆ ♪ ♫ ･ﾟ⋆",
  },
};

/**
 * Custom MP3 player
 *
 * Custom HTML5 audio player with full controls, artwork, and track info.
 * Features play/pause, seek, volume control, and time display.
 */
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
 * Minimal MP3 player
 *
 * MP3 player without artwork, showing only controls and minimal info.
 * Perfect for clean, text-focused layouts.
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

/**
 * MP3 player without track info
 *
 * Ultra minimal player showing only controls.
 */
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

/**
 * MP3 player with custom decoration
 *
 * Uses custom ASCII/kawaii decorations for a unique look.
 */
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

/**
 * MP3 player with header and footer
 *
 * Shows how to add custom header and footer content.
 */
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
