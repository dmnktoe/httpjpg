# @httpjpg/tsconfig

Shared TypeScript configuration for the httpjpg monorepo.

## Overview

This package provides reusable TypeScript configurations that enforce consistent compiler settings across all packages and applications in the monorepo.

## Configurations

### `base.json`

Base configuration with strict type checking and modern ES features. Used by all packages.

**Key Features:**
- Strict mode enabled (`strict: true`, `strictNullChecks: true`)
- Modern module resolution (`moduleResolution: "bundler"`)
- Incremental compilation for faster builds
- Skip lib checks for faster type checking

**Target:** ES6  
**Module:** Preserve (for bundler compatibility)

### `react-library.json`

Configuration for React component libraries (extends `base.json`).

**Additional Settings:**
- JSX preservation (`jsx: "preserve"`)
- DOM type definitions
- ESNext module system

**Use in:** `@httpjpg/ui`, Storybook

### `nextjs.json`

Configuration for Next.js applications (extends `base.json`).

**Additional Settings:**
- Next.js plugin integration
- No emit (Next.js handles compilation)
- DOM and ESNext type definitions
- Auto-includes `next-env.d.ts`

**Use in:** Next.js apps

## Usage

Install in your package:

```json
{
  "devDependencies": {
    "@httpjpg/tsconfig": "workspace:*"
  }
}
```

Extend in your `tsconfig.json`:

```jsonc
{
  "extends": "@httpjpg/tsconfig/base.json",
  "compilerOptions": {
    // Your overrides
  }
}
```

### React Library

```jsonc
{
  "extends": "@httpjpg/tsconfig/react-library.json",
  "include": ["src"]
}
```

### Next.js App

```jsonc
{
  "extends": "@httpjpg/tsconfig/nextjs.json",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
```

## Philosophy

- **Strict by default** - Catch errors early with strict type checking
- **Modern standards** - Use latest TypeScript and ES features
- **Bundler-first** - Optimized for Vite, Turbopack, and modern bundlers
- **Incremental** - Fast rebuilds with incremental compilation
- **Minimal** - No unnecessary options, focused on essentials

## Compiler Options

| Option | Value | Why |
|--------|-------|-----|
| `strict` | `true` | Maximum type safety |
| `moduleResolution` | `bundler` | Modern bundler compatibility |
| `esModuleInterop` | `true` | Better CommonJS/ESM interop |
| `skipLibCheck` | `true` | Faster type checking |
| `isolatedModules` | `true` | Safe for single-file transpilation |
| `forceConsistentCasingInFileNames` | `true` | Cross-platform consistency |

## Excluded Patterns

All configs automatically exclude:
- `node_modules/`
- `dist/`
- `.next/`
- `build/`

## Troubleshooting

### "Cannot find module" errors

Make sure the package is properly installed and your workspace is configured:

```bash
pnpm install
```

### Type checking is slow

The base config has `skipLibCheck: true` enabled. For even faster checks, consider:

```jsonc
{
  "extends": "@httpjpg/tsconfig/base.json",
  "compilerOptions": {
    "incremental": true
  }
}
```

## Contributing

When modifying these configs, consider:

1. **Breaking changes** affect all packages - communicate clearly
2. **Test thoroughly** - Run `pnpm -r type-check` before committing
3. **Document changes** - Update this README with any new options
