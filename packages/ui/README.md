# @httpjpg/ui

Design system and UI components built with Panda CSS v1.7.0.

## Features

- 🎨 **Type-safe styling** with Panda CSS
- 🎭 **Design tokens** from centralized `@httpjpg/tokens` package
- 🔧 **Custom utilities** for common patterns (truncate, lineClamp)
- 📦 **Tree-shakeable** CSS with optimized output
- 🎪 **Panda Studio** for visual token exploration

## Development

### Running Panda Studio

Panda Studio is a visual development tool that lets you explore and test your design tokens interactively:

```bash
pnpm studio
```

This will start the Panda Studio dev server at `http://localhost:6006` where you can:
- Browse all design tokens (colors, typography, spacing, etc.)
- Test tokens in an interactive playground
- Generate code snippets for using tokens
- Visualize token relationships and scales

### Other Scripts

```bash
# Watch mode for development
pnpm dev

# Generate Panda CSS types and utilities
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Clean generated files
pnpm clean
```

## Design Tokens

All design tokens are centralized in the `@httpjpg/tokens` package and consumed through Panda CSS configuration:

- **Colors**: Primary, accent, neutral, success, warning, danger, yellow
- **Typography**: Font sizes, families, weights, line heights, letter spacing
- **Spacing**: Consistent spacing scale (0-24)
- **Opacity**: Standard opacity values (0-100)
- **Transitions**: Duration and easing presets
- **Sizes**: Icon, indicator, and widget sizes
- **Shadows**: Box shadow scale
- **Border Radius**: Rounded corner scale

Visit `/console/spec` in the web app to see a visual reference of all tokens.

## Configuration

The Panda CSS configuration follows v1.7.0 best practices:

- ✅ Optimized exclude patterns for better performance
- ✅ Custom utilities (truncate, lineClamp)
- ✅ ImportMap for better module resolution
- ✅ Studio configuration for visual exploration
- ✅ StaticCSS for cva recipe support
- ✅ Production optimizations (minify, hash, optimize)

## Usage

```tsx
import { Box, Button } from "@httpjpg/ui";

function MyComponent() {
  return (
    <Box css={{ p: 4, bg: "primary.500" }}>
      <Button variant="primary" size="md">
        Click me
      </Button>
    </Box>
  );
}
```

## Architecture

```
packages/ui/
├── src/
│   ├── components/     # React components
│   └── styles/         # Global styles
├── styled-system/      # Generated Panda CSS system (gitignored)
├── .panda-studio/      # Panda Studio build output (gitignored)
├── panda.config.ts     # Panda CSS configuration
├── styles.css          # Generated CSS output
└── package.json
```
