# @httpjpg/storyblok-api

REST API wrapper for Storyblok with Next.js integration.

## Features

- ✅ REST API (not GraphQL)
- ✅ Draft mode support
- ✅ Type-safe API calls
- ✅ Built-in caching
- ✅ Next.js Cache tags support
- ✅ Automatic token selection (preview vs published)

## Installation

```bash
pnpm add @httpjpg/storyblok-api
```

## Usage

### Get a single story

```typescript
import { getStoryblokApi } from "@httpjpg/storyblok-api";

const { getStory } = getStoryblokApi({ draftMode: false });

const story = await getStory({
  slug: "portfolio/project-1",
  resolve_relations: ["author"],
});
```

### Get multiple stories

```typescript
const { getStories } = getStoryblokApi();

const { stories, total } = await getStories({
  starts_with: "portfolio/",
  per_page: 10,
  page: 1,
});
```

### Get all slugs (for static generation)

```typescript
const { getAllSlugs } = getStoryblokApi();

const slugs = await getAllSlugs({
  starts_with: "portfolio/",
});
```

### With Next.js Draft Mode

```typescript
import { draftMode } from "next/headers";

const { isEnabled } = draftMode();
const { getStory } = getStoryblokApi({ draftMode: isEnabled });
```

## API Reference

### `getStoryblokApi(config)`

Returns API methods with configuration.

**Config:**
- `draftMode?: boolean` - Enable draft mode (uses preview token)
- `cache?: RequestCache` - Next.js cache strategy

**Returns:**
- `client` - Raw Storyblok client
- `getStory()` - Fetch single story
- `getStories()` - Fetch multiple stories
- `getAllSlugs()` - Fetch all slugs for static generation

## Cache Tags

```typescript
import { CACHE_TAGS } from "@httpjpg/storyblok-api";

// Revalidate specific story
revalidateTag(CACHE_TAGS.STORY("portfolio/project-1"));

// Revalidate all stories
revalidateTag(CACHE_TAGS.STORIES);
```
