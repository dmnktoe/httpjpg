# @httpjpg/config

Shared runtime configuration for the httpjpg monorepo.

## Overview

This package provides type-safe, centralized configuration that can be shared across all applications and packages in the monorepo. Configuration is defined once and validated with TypeScript types.

## Features

- **Type-safe** - Full TypeScript support with strict validation
- **Centralized** - Single source of truth for all configuration
- **Immutable** - Configuration is `as const` to prevent mutations
- **Validated** - Uses `satisfies Config` for compile-time validation
- **Extensible** - Easy to add new configuration sections

## Structure

```
config/
├── index.ts       # Main configuration export
├── types.ts       # TypeScript type definitions
├── package.json   # Package metadata
└── tsconfig.json  # TypeScript configuration
```

## Usage

Install in your application:

```json
{
  "dependencies": {
    "@httpjpg/config": "workspace:*"
  }
}
```

Import the configuration:

```typescript
import { config } from "@httpjpg/config";

// Access configuration values
console.log(config.appName); // "httpjpg"
console.log(config.ui.defaultTheme); // "light"
```

## Configuration Schema

### Root Level

| Property | Type | Description |
|----------|------|-------------|
| `appName` | `string` | Application name identifier |
| `ui` | `UIConfig` | Frontend/UI configuration |

### UI Configuration

| Property | Type | Description |
|----------|------|-------------|
| `enabledThemes` | `Array<"light" \| "dark">` | Available theme options |
| `defaultTheme` | `"light" \| "dark"` | Default theme on first load |

## Examples

### Accessing Configuration

```typescript
import { config } from "@httpjpg/config";

// Check available themes
if (config.ui.enabledThemes.includes("dark")) {
  console.log("Dark mode is available!");
}

// Get default theme
const theme = config.ui.defaultTheme;
```

### Type-Safe Validation

The configuration uses TypeScript's `satisfies` operator to ensure all values match the schema:

```typescript
export const config = {
  appName: "httpjpg",
  ui: {
    enabledThemes: ["light", "dark"],
    defaultTheme: "light", // ✅ Must be one of enabledThemes
  },
} as const satisfies Config;
```

If you try to set an invalid value, TypeScript will error:

```typescript
// ❌ Error: Type '"invalid"' is not assignable to type '"light" | "dark"'
defaultTheme: "invalid"
```

## Extending Configuration

To add new configuration sections:

### 1. Update the Type Definition (`types.ts`)

```typescript
export type Config = {
  appName: string;
  ui: {
    enabledThemes: Array<"light" | "dark">;
    defaultTheme: Config["ui"]["enabledThemes"][number];
  };
  // Add your new section
  api: {
    baseUrl: string;
    timeout: number;
  };
};
```

### 2. Update the Configuration (`index.ts`)

```typescript
export const config = {
  appName: "httpjpg",
  ui: {
    enabledThemes: ["light", "dark"],
    defaultTheme: "light",
  },
  // Add your values
  api: {
    baseUrl: "https://api.httpjpg.com",
    timeout: 5000,
  },
} as const satisfies Config;
```

### 3. Access in Your Code

```typescript
import { config } from "@httpjpg/config";

fetch(config.api.baseUrl, {
  timeout: config.api.timeout,
});
```

## Best Practices

### ✅ Do

- Use `as const` for immutable configuration
- Validate with `satisfies Config` for type safety
- Keep configuration flat and simple
- Use discriminated unions for theme/mode options
- Document configuration changes in this README

### ❌ Don't

- Store secrets or sensitive data (use environment variables)
- Add runtime-dependent values (use environment variables)
- Create deeply nested configuration objects
- Mutate configuration at runtime
- Add configuration that varies by environment

## Environment-Specific Configuration

For values that change per environment (dev/staging/prod), use environment variables instead:

```typescript
// ❌ Don't put in @httpjpg/config
const apiKey = process.env.API_KEY;

// ✅ Do: Use environment variables
// apps/web/.env
API_KEY=your_key_here
```

## Type Exports

The package exports both the configuration and its types:

```typescript
import { config, type Config } from "@httpjpg/config";

// Use the type for functions accepting config
function initializeApp(appConfig: Config) {
  // ...
}

initializeApp(config);
```

## Migration from Environment Variables

If you're migrating from environment variables to this config package:

**Before:**
```typescript
const appName = process.env.NEXT_PUBLIC_APP_NAME || "httpjpg";
const theme = process.env.NEXT_PUBLIC_DEFAULT_THEME || "light";
```

**After:**
```typescript
import { config } from "@httpjpg/config";

const appName = config.appName;
const theme = config.ui.defaultTheme;
```

## Development

Run type checking:

```bash
pnpm type-check
```

## Contributing

When adding configuration:

1. Update `types.ts` first with proper TypeScript types
2. Update `index.ts` with actual values
3. Add documentation to this README
4. Consider if it should be an environment variable instead
5. Test in consuming packages before committing
