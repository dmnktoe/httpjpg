# @httpjpg/storyblok-utils

Utility functions and components for Storyblok integration.

## Features

- ✅ Slug management (with/without app folder)
- ✅ Asset optimization (image service)
- ✅ Link props conversion (Next.js compatible)
- ✅ Dynamic component rendering
- ✅ TypeScript types for Storyblok

## Usage

### Slug Utilities

```typescript
import { getSlugWithAppName, getSlugWithoutAppName } from "@httpjpg/storyblok-utils";

// Add main folder prefix
const fullSlug = getSlugWithAppName({ slug: "project-1" });
// => "portfolio/project-1"

// Remove main folder prefix
const slug = getSlugWithoutAppName("portfolio/project-1");
// => "project-1"
```

### Asset Optimization

```typescript
import { getAssetFromStoryblok } from "@httpjpg/storyblok-utils";

const optimizedUrl = getAssetFromStoryblok(story.content.image, {
  width: 800,
  height: 600,
  quality: 80,
  format: "webp",
});
```

### Link Props

```typescript
import { getLinkPropsFromStoryblok } from "@httpjpg/storyblok-utils";
import Link from "next/link";

const linkProps = getLinkPropsFromStoryblok(story.content.link);

<Link {...linkProps}>Click me</Link>
```

### Dynamic Rendering

```typescript
import { DynamicRender } from "@httpjpg/storyblok-utils";

// Render single block
<DynamicRender data={story.content.hero} />

// Render array of blocks
<DynamicRender data={story.content.sections} />

// Render as list items
<ul>
  <DynamicRender data={story.content.items} asList />
</ul>
```

## Types

```typescript
import type {
  BlokItem,
  StoryblokStory,
  StoryblokAsset,
  StoryblokLink,
} from "@httpjpg/storyblok-utils";
```
