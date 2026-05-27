#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { borderRadius } from "../src/border-radius.js";
import { colors } from "../src/colors.js";
import { shadows } from "../src/shadows.js";
import { spacing } from "../src/spacing.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function generateCSSVariables(tokens: Record<string, any>, prefix: string, parentKey = ""): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    const fullKey = parentKey ? `${parentKey}-${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      lines.push(generateCSSVariables(value, prefix, fullKey));
    } else {
      const cssVarName = `--${prefix}-${toKebabCase(fullKey)}`;
      lines.push(`\t${cssVarName}: ${value};`);
    }
  }

  return lines.join("\n");
}

const cssContent = `:root {
${generateCSSVariables(colors, "color")}

${generateCSSVariables(spacing, "spacing")}

${generateCSSVariables(borderRadius, "radius")}

${generateCSSVariables(shadows, "shadow")}
}
`;

const distDir = join(__dirname, "..", "dist");
const outputPath = join(distDir, "tokens.css");

mkdirSync(distDir, { recursive: true });
writeFileSync(outputPath, cssContent, "utf-8");
console.log(`✅ Generated CSS variables at ${outputPath}`);
