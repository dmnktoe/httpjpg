# @httpjpg/env

Type-safe environment variables for Next.js with validation at build time.

## Features

- ✅ Type-safe environment variables
- ✅ Runtime validation with Zod
- ✅ Build-time validation
- ✅ Server/Client variable separation
- ✅ IntelliSense support

## Usage

```typescript
import { env } from "@httpjpg/env";

// Server-side only
console.log(env.STORYBLOK_PREVIEW_TOKEN);

// Client-side (NEXT_PUBLIC_*)
console.log(env.NEXT_PUBLIC_APP_URL);
```

## Environment Variables

### Server-only

- `STORYBLOK_PREVIEW_TOKEN` - Storyblok preview access token

### Client-side

- `NEXT_PUBLIC_APP_URL` - Your application URL
- `NEXT_PUBLIC_STORYBLOK_API_URL` - Storyblok API endpoint
- `NEXT_PUBLIC_STORYBLOK_TOKEN` - Storyblok public token
- `NEXT_PUBLIC_STORYBLOK_VERSION` - Content version (draft/published)
- `NEXT_PUBLIC_STORYBLOK_MAIN_FOLDER` - Main content folder name

## Skip Validation

Set `SKIP_ENV_VALIDATION=true` to skip validation during development.
