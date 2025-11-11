# @httpjpg/tokens

Central design tokens package for the httpjpg monorepo. Provides type-safe design tokens for colors, typography, spacing, border radius, and shadows compatible with Panda CSS-in-JS.

## Installation

This package is part of the httpjpg Turborepo monorepo and uses workspace dependencies.

## Usage

### Import individual token categories

```typescript
import { colors, typography, spacing } from "@httpjpg/tokens";
```

### Import complete tokens object

```typescript
import { tokens } from "@httpjpg/tokens";
```

# @httpjpg/tokens

Central design tokens package for the httpjpg monorepo. Provides type-safe design tokens for colors, typography, spacing, border radius, and shadows.

## Usage

Import token categories or the full tokens object:

```typescript
import { colors, typography, spacing } from '@httpjpg/tokens';
import { tokens } from '@httpjpg/tokens';
```

These tokens can be used directly in TypeScript, or exposed as CSS custom properties via `@httpjpg/ui/styles/global` for runtime usage in stylesheets or Linaria.

## Token Categories

- **Colors**: Monochromatic palette (black, white, neutral scale)
- **Typography**: Font families, sizes, weights, letter spacing, line heights
- **Spacing**: Functional spacing scale (0-96)
- **Border Radius**: Minimal border radius values
- **Shadows**: Minimal shadow values

## TypeScript Support

All tokens are fully typed. Import types for autocomplete and type checking:

```typescript
import type { Colors, Typography, Spacing } from '@httpjpg/tokens';
```


## TypeScript Support


