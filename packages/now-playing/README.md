# @httpjpg/now-playing

Draggable floating "Now Playing" widget with Spotify-inspired design.

## Features

- 🎵 Spotify-style glassmorphism design
- 🖱️ Fully draggable with Framer Motion
- 🎨 Crisp album artwork with blurred background
- 📜 iOS-style marquee for long text
- ⚡ Smooth animations and interactions

## Usage

```tsx
import { NowPlaying } from '@httpjpg/now-playing';

<NowPlaying
  title="Song Title"
  artist="Artist Name"
  artwork="/path/to/artwork.jpg"
  isPlaying={true}
/>
```
