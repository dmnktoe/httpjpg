# @httpjpg/storybook

Component development and documentation workspace for the `@httpjpg/ui` package.

## Overview

This Storybook instance provides an interactive environment for developing, testing, and documenting UI components from the `@httpjpg/ui` package. It's configured to work seamlessly with Linaria's zero-runtime CSS-in-JS approach via the `@wyw-in-js/vite` plugin.

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
- **Linaria Integration**: Zero-runtime CSS extraction with full HMR support

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

- `.storybook/main.ts` - Main Storybook configuration with Vite and Linaria setup
- `.storybook/preview.ts` - Global decorators and parameters
- `tsconfig.json` - TypeScript configuration

## Troubleshooting

### Linaria Styles Not Extracting

Make sure you're using **static CSS** with `css()` from `@linaria/core`. Avoid template literal interpolations with runtime functions:

```tsx
// ✅ Good - Static CSS
const button = css`
  background: #000;
  color: #fff;
`;

// ❌ Bad - Runtime interpolation
const button = css`
  background: ${(props) => props.color};
`;
```

### Cache Issues

Clear all caches and restart:

```bash
rm -rf node_modules/.cache .cache
pnpm dev
```

## Learn More

- [Storybook Documentation](https://storybook.js.org/docs)
- [Linaria Documentation](https://linaria.dev)
- [wyw-in-js GitHub](https://github.com/Andarist/wyw-in-js)
