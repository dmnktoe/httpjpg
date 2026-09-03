#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { borderRadius } from "../src/border-radius.js";
import { colors } from "../src/colors.js";
import { shadows } from "../src/shadows.js";
import { spacing } from "../src/spacing.js";
import { renderTokensCss } from "./lib/css-vars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cssContent = renderTokensCss({ colors, spacing, borderRadius, shadows });

const distDir = join(__dirname, "..", "dist");
const outputPath = join(distDir, "tokens.css");

mkdirSync(distDir, { recursive: true });
writeFileSync(outputPath, cssContent, "utf-8");
console.log(`✅ Generated CSS variables at ${outputPath}`);
