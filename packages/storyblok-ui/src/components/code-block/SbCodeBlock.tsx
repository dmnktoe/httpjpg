import type { SbCodeBlockData } from "@httpjpg/storyblok-utils";
import { Box, CodeBlock } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbCodeBlockProps {
  blok: SbCodeBlockData;
}

export const SbCodeBlock = memo(function SbCodeBlock({ blok }: SbCodeBlockProps) {
  const { code, language, filename, showLineNumbers, copyable } = blok;

  if (!code) {
    return null;
  }

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <CodeBlock
        code={code}
        language={language || undefined}
        filename={filename || undefined}
        showLineNumbers={showLineNumbers}
        copyable={copyable ?? true}
      />
    </Box>
  );
});

SbCodeBlock.displayName = "SbCodeBlock";
