import { Box, CodeBlock } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbCodeBlockProps {
  blok: BlokSpacing & {
    _uid: string;
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
    copyable?: boolean;
  };
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
