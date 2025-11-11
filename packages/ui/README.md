# @httpjpg/ui

# @httpjpg/ui

Modern UI component library built with **Linaria** - zero-runtime CSS-in-JS with build-time extraction.

## Features

# @httpjpg/ui

Modern UI component library built with Linaria — zero-runtime CSS-in-JS with build-time extraction.

## Features

- Zero-runtime CSS extraction (Linaria)
- Type-safe components with full TypeScript support
- Accessible defaults (focus-visible, keyboard interaction)
- Fluid, responsive typography and spacing

## Quick Start

```bash
pnpm install
```

Import global CSS custom properties:

```tsx
import '@httpjpg/ui/styles/global';
```

Usage:

```tsx
import { Button, Headline } from '@httpjpg/ui';

<Headline level={1}>Welcome</Headline>
<Button variant="primary" size="md">Get started</Button>
```

## Notes on Migration

This package was migrated from Panda CSS to Linaria. If you used Panda codegen previously, you can remove old artifacts such as `.panda` and any `panda.config.*` files.

When using Linaria, prefer CSS custom properties from `@httpjpg/ui/styles/global` or inline static values — Linaria evaluates styles at build-time.

## Development

- Type check: `pnpm type-check`
- Lint: `pnpm lint`
- Storybook: `cd apps/storybook && pnpm dev`

For details about components, see the source in `packages/ui/src/components`.

```tsx
import { Button, Headline } from "@httpjpg/ui";

export { Button, Headline };
```

## Development

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Generate Panda CSS

After making changes to components or tokens, regenerate the styled-system:

```bash
pnpm panda
```
