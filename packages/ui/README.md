# @httpjpg/ui

Production-ready UI component library built with **Panda CSS** and integrated with `@httpjpg/tokens`.

## Features

- ✨ **Zero-runtime CSS-in-JS** with Panda CSS
- 🎨 **Type-safe design tokens** from `@httpjpg/tokens`
- 📦 **Tree-shakeable** components
- ♿ **Accessible** by default
- 🎯 **TypeScript** first
- 🚀 **Optimized for Next.js**

## Installation

This package is part of the `@httpjpg` monorepo and uses workspace dependencies.

```bash
pnpm install
```

## Usage in Next.js

### 1. Import global styles in your layout

```tsx
// app/layout.tsx
import "@httpjpg/ui/styles/global";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Use components

```tsx
import { Headline, Paragraph, Button } from "@httpjpg/ui";

export default function Page() {
  return (
    <main>
      <Headline level={1}>Welcome</Headline>
      <Paragraph size="lg">
        This is a production-ready UI component library.
      </Paragraph>
      <Button variant="primary">Get Started</Button>
    </main>
  );
}
```

### 3. Use Panda CSS utilities directly

```tsx
import { css } from "@httpjpg/ui/css";
import { stack } from "@httpjpg/ui/patterns";

export function MyComponent() {
  return (
    <div className={stack({ gap: 4, align: "center" })}>
      <h1 className={css({ fontSize: "2xl", color: "primary.500" })}>
        Hello World
      </h1>
    </div>
  );
}
```

## Available Exports

### Components

```tsx
import { Headline, Paragraph, Button } from "@httpjpg/ui";
// or
import { Headline } from "@httpjpg/ui/components";
```

### Panda CSS Utilities

```tsx
// CSS function and variants
import { css, cx, cva } from "@httpjpg/ui/css";

// Patterns (layout utilities)
import { stack, flex, grid, center } from "@httpjpg/ui/patterns";

// Design tokens
import { token } from "@httpjpg/ui/tokens";
```

### Global Styles

```tsx
import "@httpjpg/ui/styles/global";
```

## Available Components

### Headline

Semantic heading component with responsive typography.

```tsx
<Headline level={1}>Page Title</Headline>
<Headline level={2} as="h1">Visual h2, Semantic h1</Headline>
```

**Props:**

- `level?: 1 | 2 | 3` - Visual hierarchy level
- `as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"` - HTML element override

### Paragraph

Body text component with optimal typography.

```tsx
<Paragraph size="lg" align="center">
  Large centered paragraph text
</Paragraph>
```

**Props:**

- `size?: "sm" | "md" | "lg"` - Text size variant
- `align?: "left" | "center" | "right"` - Text alignment
- `maxWidth?: boolean` - Constrain width for readability (default: true)

## Development

### Scripts

```bash
# Generate Panda CSS (runs automatically on install)
pnpm prepare

# Watch mode for development
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Clean generated files
pnpm clean
```

### Adding New Components

1. Create component in `src/components/your-component/`
2. Use Panda CSS `cva()` for variants
3. Export from `src/components/index.ts`
4. Components automatically get design tokens from `@httpjpg/tokens`

Example:

```tsx
"use client";

import { css, cx, cva } from "../../../styled-system/css";
import type { HTMLAttributes } from "react";

const cardRecipe = cva({
  base: {
    padding: 4,
    borderRadius: "lg",
    backgroundColor: "white",
    boxShadow: "md",
  },
  variants: {
    size: {
      sm: { padding: 3 },
      md: { padding: 4 },
      lg: { padding: 6 },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(css(cardRecipe.raw()), className)} {...props} />;
}
```

## Architecture

- **Zero-runtime**: Panda CSS generates static CSS at build time
- **Type-safe**: Full TypeScript support with generated types
- **Token integration**: Automatic sync with `@httpjpg/tokens`
- **Tree-shakeable**: Only import what you use
- **Next.js optimized**: Works seamlessly with App Router and Server Components

## License

Private package for @httpjpg monorepo
