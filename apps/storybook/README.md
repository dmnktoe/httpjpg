# @httpjpg/storybook

Component development and documentation workspace for the `@httpjpg/ui` package.

## Overview

This Storybook instance provides an interactive environment for developing, testing, and documenting UI components from the `@httpjpg/ui` package. It's configured to work seamlessly with Panda CSS for type-safe, zero-runtime styling.

## Getting Started

Start the Storybook development server:

```bash
pnpm dev
```

This will launch Storybook at [http://localhost:6006](http://localhost:6006).

## Features

- **Component Playground**: Interactive controls for all component props
- **Live Documentation**: Auto-generated docs from TypeScript types and JSDoc comments
- **Hot Module Replacement**: Instant updates when you edit component code
- **Panda CSS Integration**: Type-safe, zero-runtime CSS with full design token support

## Adding New Stories

Create a new `.stories.tsx` file in the `stories/` directory:

```tsx
import { YourComponent } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Define interactive controls here
  },
} satisfies Meta<typeof YourComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Configuration

Key configuration files:

- `.storybook/main.ts` - Main Storybook configuration with Vite setup
- `.storybook/preview.ts` - Global styles and parameters (imports Panda CSS)
- `tsconfig.json` - TypeScript configuration

## Troubleshooting

### Panda CSS Styles Not Applying

Make sure you've regenerated the Panda CSS output after making changes:

```bash
cd ../../packages/ui
pnpm panda cssgen --outfile styles.css
```

### Cache Issues

Clear all caches and restart:

```bash
rm -rf node_modules/.cache .cache .turbo
pnpm dev
```

## Learn More

- [Storybook Documentation](https://storybook.js.org/docs)
- [Panda CSS Documentation](https://panda-css.com)
- [@httpjpg/ui Package](../../packages/ui/README.md)
