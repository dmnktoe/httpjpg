# Music Player Component

ASCII-styled music widget for the httpjpg portfolio. Supports Spotify embeds, SoundCloud embeds, and custom MP3 files with a cute kawaii aesthetic.

## Features

- 🎵 **Multi-source support**: Spotify, SoundCloud, MP3
- 🎨 **ASCII/kawaii decorations**: Matching portfolio brutalist style
- 🎛️ **Custom HTML5 audio player**: Full controls for MP3s (play/pause, seek, volume)
- 📱 **Responsive and accessible**: Works on all devices
- ✨ **Storyblok CMS integration**: Easy content management

## Usage

### In React/Next.js

```tsx
import { MusicPlayer } from "@httpjpg/ui";

// Spotify track
<MusicPlayer
  source="spotify"
  src="spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
  decoration="♪ ♫ ♪"
/>

// SoundCloud track
<MusicPlayer
  source="soundcloud"
  src="https://soundcloud.com/artist/track"
  decoration="♪ ♫ ♪"
/>

// Custom MP3
<MusicPlayer
  source="mp3"
  src="https://example.com/track.mp3"
  title="My Track"
  artist="Artist Name"
  artwork="https://example.com/artwork.jpg"
  decoration="♪ ♫ ♪"
/>
```

### In Storyblok CMS

1. Add a new **Music Player** component to your Storyblok content
2. Configure the fields:
   - **Source**: Choose Spotify, SoundCloud, or MP3
   - **Source URL/ID**: Enter the track URL or Spotify URI
   - **Title**: Track title (for MP3)
   - **Artist**: Artist name (for MP3)
   - **Artwork**: Upload album artwork (for MP3)
   - **Decoration**: Custom ASCII pattern (default: "♪ ♫ ♪ ♫ ♪ ♫ ♪")
   - **Show Artwork**: Toggle artwork display
   - **Show Track Info**: Toggle track info display

## Component Props

### MusicPlayer (Base Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `"spotify" \| "soundcloud" \| "mp3" \| "custom"` | `"mp3"` | Music source type |
| `src` | `string` | - | Source URL or ID (required) |
| `title` | `string` | - | Track title (for MP3) |
| `artist` | `string` | - | Artist name (for MP3) |
| `artwork` | `string` | - | Album artwork URL (for MP3) |
| `showArtwork` | `boolean` | `true` | Show album artwork |
| `showInfo` | `boolean` | `true` | Show track info |
| `autoPlay` | `boolean` | `false` | Auto play audio |
| `decoration` | `string` | `"♪ ♫ ♪ ♫ ♪ ♫ ♪"` | ASCII decoration pattern |
| `headerContent` | `ReactNode` | - | Custom content above player |
| `footerContent` | `ReactNode` | - | Custom content below player |

## Source Types

### Spotify

Supports Spotify track, album, and playlist embeds.

**Format options:**
- URI: `spotify:track:3n3Ppam7vgaVa1iaRUc9Lp`
- URL: `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`
- ID only: `3n3Ppam7vgaVa1iaRUc9Lp` (defaults to track)

### SoundCloud

Supports SoundCloud track embeds.

**Format:**
- Full URL: `https://soundcloud.com/artist/track`

### MP3

Custom HTML5 audio player with full controls.

**Format:**
- Direct MP3 URL: `https://example.com/audio.mp3`

## Styling

The component uses the portfolio's ASCII/kawaii aesthetic:
- Border: 2px solid black
- Background: Neutral 50
- Font: Monospace
- Decorations: ASCII music symbols (♪ ♫ ⋆ ✮)

## Examples

See the Storybook documentation for interactive examples:
- Spotify track/album embeds
- SoundCloud track embed
- Custom MP3 player with controls
- Minimal MP3 player
- Custom decorations
- Header and footer content

## Development

```bash
# Install dependencies
pnpm install

# Run Storybook
pnpm --filter @httpjpg/storybook dev

# Lint
pnpm biome check packages/ui/src/components/music-player/

# Type check
pnpm --filter @httpjpg/storyblok-ui run typecheck
```

## Syncing to Storyblok

To sync the component schema to your Storyblok space:

```bash
# Set environment variables
export STORYBLOK_MANAGEMENT_TOKEN=your-token
export STORYBLOK_SPACE_ID=your-space-id

# Run sync script
pnpm --filter @httpjpg/storyblok-ui sync:components
```

## Architecture

The component is split into two packages:

1. **@httpjpg/ui/components/music-player**: Base React component
2. **@httpjpg/storyblok-ui/components/music-player**: Storyblok CMS wrapper

This separation allows the component to be used both directly in React and via Storyblok CMS.
