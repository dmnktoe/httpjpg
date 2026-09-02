interface TokenMap {
  [key: string]: string | number | TokenMap;
}

export function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function generateCSSVariables(tokens: TokenMap, prefix: string, parentKey = ""): string {
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

export function renderTokensCss(input: {
  colors: TokenMap;
  spacing: TokenMap;
  borderRadius: TokenMap;
  shadows: TokenMap;
}): string {
  return `:root {
${generateCSSVariables(input.colors, "color")}

${generateCSSVariables(input.spacing, "spacing")}

${generateCSSVariables(input.borderRadius, "radius")}

${generateCSSVariables(input.shadows, "shadow")}
}
`;
}
