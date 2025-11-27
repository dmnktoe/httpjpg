# @httpjpg/storyblok-sync

Automated synchronization of design tokens and component schemas to Storyblok via Management API.

## Features

- 🎨 **Datasource Sync**: Automatically sync design tokens (spacing, colors, typography) to Storyblok datasources
- 🧩 **Component Sync**: Generate Storyblok component schemas from TypeScript interfaces
- 🔄 **Smart Updates**: Only updates changed entries, preserves existing data
- 🗑️ **Auto Cleanup**: Removes deprecated entries automatically
- 📦 **Standalone Package**: Reusable across projects

## Installation

This package is already included in the monorepo workspace:

```bash
pnpm install
```

## Setup

### Required Environment Variables

Create a `.env.local` file in your project root:

```bash
# Get from: https://app.storyblok.com/#!/me/account?tab=token
STORYBLOK_MANAGEMENT_TOKEN=your-personal-access-token

# Find in: Storyblok Settings → General
STORYBLOK_SPACE_ID=your-space-id
```

## Usage

### Sync Design Tokens to Datasources

```bash
pnpm --filter @httpjpg/storyblok-sync sync:datasources
```

This creates/updates the following datasources:
- `spacing-options` - Padding/margin values (None, XS, Small, Medium, Large, XL, 2XL, 3XL, 4XL)
- `width-options` - Container widths (Full Width, Container, Narrow)
- `grid-columns` - Grid columns (1-6, Auto Fit)
- `aspect-ratio-options` - Media ratios (16:9, 4:3, 1:1, 3:4, 9:16, 21:9)
- `background-color-options` - Background colors (White, Black, Gray, Primary, Accent)
- `text-color-options` - Text colors
- `font-family` - Font families (Sans, Headline, Accent, Mono)
- `font-size` - Font sizes (Small, Medium, Base, Large, XL)
- `font-weight` - Font weights (Light, Normal, Medium, Semibold, Bold, Black)
- `animation-duration` - Animation timings (Fast, Normal, Slow)
- `animation-easing` - Easing functions (Linear, Ease, Ease In/Out)

### Sync Component Schemas

```bash
pnpm --filter @httpjpg/storyblok-sync sync:components
```

This creates/updates the following components:
- **Layout**: `section`, `container`, `grid`
- **Typography**: `headline`, `paragraph`
- **Media**: `image`, `video`, `slideshow`

### Sync Everything

```bash
pnpm --filter @httpjpg/storyblok-sync sync:all
```

## Architecture

### File Structure

```
packages/storyblok-sync/
├── src/
│   ├── api.ts          # Storyblok API utilities
│   ├── types.ts        # TypeScript types
│   └── index.ts        # Public exports
├── scripts/
│   ├── sync-datasources.ts    # Datasource sync script
│   └── sync-components.ts     # Component sync script
└── package.json
```

### How It Works

#### Datasource Sync
1. Reads design tokens from code
2. Generates datasource entries with human-friendly labels
3. Creates or updates datasources via Management API
4. Removes deprecated entries

#### Component Sync
1. Defines component schemas based on TypeScript interfaces
2. Maps TypeScript types to Storyblok field types:
   - `string` → `text` or `textarea`
   - `boolean` → `boolean`
   - `number` → `number`
   - `SbBlokData[]` → `bloks` (nested components)
   - Asset types → `asset` with filetypes
3. Creates or updates components via Management API

### Mapping System

Components use mapping functions to convert datasource values to design tokens:

```typescript
// Storyblok Editor: User selects "Medium" from dropdown
paddingTop?: string; // = "Medium"

// Component maps to token
mapSpacingToToken("Medium") // → "8"

// Panda CSS compiles to CSS
padding-top: 2rem; // (8 * 0.25rem)
```

## Extending

### Add New Datasource

1. Create generator function in `sync-datasources.ts`:

```typescript
function generateMyDatasource(): {
  datasource: Datasource;
  entries: DatasourceEntry[];
} {
  return {
    datasource: {
      name: "My Options",
      slug: "my-options",
    },
    entries: [
      { name: "Option 1", value: "value1" },
      { name: "Option 2", value: "value2" },
    ],
  };
}
```

2. Add to sync array:

```typescript
const datasources = [
  // ... existing
  generateMyDatasource(),
];
```

### Add New Component

1. Create component function in `sync-components.ts`:

```typescript
function getSbMyComponent(): StoryblokComponent {
  return {
    name: "my-component",
    display_name: "My Component",
    is_nestable: true,
    schema: {
      title: {
        type: "text",
        display_name: "Title",
        required: true,
      },
      // ... more fields
    },
  };
}
```

2. Add to sync array:

```typescript
const components = [
  // ... existing
  getSbMyComponent(),
];
```

## Troubleshooting

### Missing Environment Variables

```
❌ Missing STORYBLOK_MANAGEMENT_TOKEN environment variable
```

**Solution**: Add `STORYBLOK_MANAGEMENT_TOKEN` and `STORYBLOK_SPACE_ID` to `.env.local`

### API Errors

```
Storyblok API error (401): Unauthorized
```

**Solution**: Check if your Management Token is valid and has correct permissions

### Datasource Not Appearing

After syncing, datasources may take a few seconds to appear in the Visual Editor. Refresh the page if needed.

## Related Packages

- `@httpjpg/tokens` - Design token definitions
- `@httpjpg/storyblok-ui` - Storyblok component implementations
- `@httpjpg/env` - Environment variable validation

## API Reference

### `storyblokRequest<T>(endpoint, method, body)`

Make authenticated request to Storyblok Management API.

### `validateEnv()`

Validate required environment variables (throws if missing).

### `getEnv()`

Get environment variables object.

## License

Private
