# @httpjpg/tokens

Central design tokens package providing type-safe, consistent design values across the httpjpg monorepo.

## Features

- 🎨 **Type-safe tokens** - Full TypeScript support
- 📦 **Tree-shakeable** - Import only what you need
- 🔄 **Single source of truth** - Shared across all packages
- 🎯 **Framework agnostic** - Works with any styling solution
- 🚀 **Zero dependencies** - Pure TypeScript objects

## Installation

This package is part of the `@httpjpg` monorepo and uses workspace dependencies.

```bash
pnpm install
```

## Token Categories

### Colors

Monochromatic palette with vibrant accent colors.

```typescript
import { colors } from "@httpjpg/tokens";
// or
import { colors } from "@httpjpg/tokens/colors";

colors.black;           // "#000000"
colors.white;           // "#FFFFFF"
colors.neutral[500];    // "#737373"
colors.primary[500];    // "#F43F5E" - vibrant rose/pink
colors.accent[500];     // "#F97316" - vibrant orange
```

**Available scales:**

- `neutral`: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- `primary`: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- `accent`: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Typography

Font families, sizes, weights, line heights, and letter spacing.

```typescript
import { typography } from "@httpjpg/tokens";
// or
import { typography } from "@httpjpg/tokens/typography";

typography.fontFamily.sans;  // ["system-ui", "-apple-system", ...]
typography.fontFamily.mono;  // ["ui-monospace", "SFMono-Regular", ...]

typography.fontSize.base;    // ["1rem", { lineHeight: "1.5rem" }]
typography.fontSize["2xl"];  // ["1.5rem", { lineHeight: "2rem" }]

typography.fontWeight.bold;  // "700"
typography.lineHeight.normal;  // "1.5"
typography.letterSpacing.tight;  // "-0.025em"
```

**Font sizes:** xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl

**Font weights:** thin, extralight, light, normal, medium, semibold, bold, extrabold, black

### Spacing

Consistent spacing scale based on rem units.

```typescript
import { spacing } from "@httpjpg/tokens";
// or
import { spacing } from "@httpjpg/tokens/spacing";

spacing[0];   // "0"
spacing[4];   // "1rem"     (16px)
spacing[8];   // "2rem"     (32px)
spacing[16];  // "4rem"     (64px)
```

**Available values:** 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

### Border Radius

Rounded corner scales.

```typescript
import { borderRadius } from "@httpjpg/tokens";
// or
import { borderRadius } from "@httpjpg/tokens/border-radius";

borderRadius.none;   // "0"
borderRadius.sm;     // "0.125rem"
borderRadius.base;   // "0.25rem"
borderRadius.lg;     // "0.5rem"
borderRadius.full;   // "9999px"
```

### Shadows

Box shadow utilities for depth and elevation.

```typescript
import { shadows } from "@httpjpg/tokens";
// or
import { shadows } from "@httpjpg/tokens/shadows";

shadows.sm;    // Subtle shadow
shadows.base;  // Default shadow
shadows.md;    // Medium shadow
shadows.lg;    // Large shadow
shadows.xl;    // Extra large shadow
shadows["2xl"]; // 2x extra large shadow
```

## Usage Examples

### With Panda CSS (Recommended)

Tokens are automatically available in Panda CSS through `@httpjpg/ui`:

```tsx
import { css } from "@httpjpg/ui/css";

const styles = css({
  color: "primary.500",        // Uses colors.primary[500]
  fontSize: "2xl",             // Uses typography.fontSize["2xl"]
  padding: 4,                  // Uses spacing[4]
  borderRadius: "lg",          // Uses borderRadius.lg
  boxShadow: "md",            // Uses shadows.md
});
```

### Direct Import

```typescript
import { colors, typography, spacing } from "@httpjpg/tokens";

const buttonStyle = {
  backgroundColor: colors.primary[500],
  color: colors.white,
  fontFamily: typography.fontFamily.sans.join(", "),
  fontSize: typography.fontSize.base[0],
  padding: `${spacing[3]} ${spacing[6]}`,
  borderRadius: borderRadius.md,
};
```

### With CSS-in-JS

```typescript
import { colors, spacing } from "@httpjpg/tokens";
import styled from "styled-components";

const Button = styled.button`
  background: ${colors.primary[500]};
  color: ${colors.white};
  padding: ${spacing[3]} ${spacing[6]};
  border-radius: ${borderRadius.md};
  
  &:hover {
    background: ${colors.primary[600]};
  }
`;
```

## Type Safety

All tokens are fully typed with TypeScript:

```typescript
import type { Colors, Typography, Spacing } from "@httpjpg/tokens";

// Use types for type-safe wrappers
function createTheme(colors: Colors) {
  // TypeScript ensures you only use valid color values
}
```

## CSS Custom Properties

Generate CSS variables from tokens:

```bash
pnpm build
```

This creates `dist/tokens.css` with CSS custom properties:

```css
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-neutral-500: #737373;
  /* ... all tokens as CSS variables */
}
```

Import in your app:

```tsx
import "@httpjpg/tokens/dist/tokens.css";
```

## Architecture

- **Pure TypeScript** - No build step required for token consumption
- **Immutable** - All tokens use `as const` for literal types
- **Composable** - Import individual token categories
- **Tree-shakeable** - Bundlers remove unused tokens
- **Version controlled** - Single source of truth in Git

## Development

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Generate CSS variables
pnpm build

# Clean generated files
pnpm clean
```

## Integration

This package is consumed by:

- `@httpjpg/ui` - Panda CSS configuration
- `apps/web` - Next.js application
- `apps/storybook` - Component documentation

## Best Practices

1. **Never hardcode values** - Always use tokens
2. **Use semantic names** - `primary` instead of `pink`
3. **Consistent spacing** - Use spacing scale instead of arbitrary values
4. **Color scales** - Use appropriate scale (50-950) for different contexts
5. **Type everything** - Import types for custom wrappers

## License

Private package for @httpjpg monorepo
