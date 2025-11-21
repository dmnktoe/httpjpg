# @httpjpg/storyblok-richtext

Rich Text renderer for Storyblok content with custom components.

## Features

- ✅ Storyblok Rich Text rendering
- ✅ Custom styled components (Link, Headline, Paragraph, Code)
- ✅ Image optimization support
- ✅ Code block syntax highlighting ready
- ✅ Type-safe with TypeScript

## Usage

```typescript
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";

// In your component
<StoryblokRichText data={story.content.richtext} />

// With custom styling
<StoryblokRichText 
  data={story.content.richtext} 
  css={{ maxW: "prose" }}
/>
```

## Supported Elements

- **Headings** (H1-H3) - Styled with Headline component
- **Paragraphs** - Styled with Paragraph component
- **Links** - Internal and external with proper target/rel
- **Images** - Optimized with alt text support
- **Code** - Inline code with mono font
- **Code Blocks** - Pre-formatted code blocks
- **Email Links** - Automatic mailto: conversion

## Custom Components

All rendered content uses @httpjpg/ui components:
- `Link` - For all hyperlinks
- `Headline` - For headings (levels 1-3)
- `Paragraph` - For body text
- `Box` - For code blocks and images

## Extending

To add custom resolvers for embedded Storyblok components, modify the `DefaultBlokResolver` function in `richtext.tsx`.
