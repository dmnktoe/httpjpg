#!/usr/bin/env node
/**
 * Generate CSS Variables from Design Tokens
 *
 * This script reads design tokens from the TypeScript modules and
 * generates a CSS file with CSS custom properties (variables).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { borderRadius } from "../src/border-radius.js";
// Import all tokens
import { colors } from "../src/colors.js";
import { shadows } from "../src/shadows.js";
import { spacing } from "../src/spacing.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generate CSS variables from token object (supports nested objects)
 */
function generateCSSVariables(
  tokens: Record<string, any>,
  prefix: string,
  parentKey = "",
): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    const fullKey = parentKey ? `${parentKey}-${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Nested object - recurse
      lines.push(generateCSSVariables(value, prefix, fullKey));
    } else {
      // Leaf value - create CSS variable
      const cssVarName = `--${prefix}-${toKebabCase(fullKey)}`;
      lines.push(`\t${cssVarName}: ${value};`);
    }
  }

  return lines.join("\n");
}

// Generate CSS content
const cssContent = `:root {
${generateCSSVariables(colors, "color")}

${generateCSSVariables(spacing, "spacing")}

${generateCSSVariables(borderRadius, "radius")}

${generateCSSVariables(shadows, "shadow")}
}
`;

// Write to dist folder
const distDir = join(__dirname, "..", "dist");
const outputPath = join(distDir, "tokens.css");

try {
  mkdirSync(distDir, { recursive: true });
  writeFileSync(outputPath, cssContent, "utf-8");
  console.log(`✅ Generated CSS variables at ${outputPath}`);
} catch (error) {
  console.error("❌ Failed to generate CSS variables:", error);
  process.exit(1);
}
