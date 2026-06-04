"use client";

import { Box } from "@httpjpg/ui";

export interface ConsentPlaceholderProps {
  vendor: string;
  height?: string | number;
  message?: string;
}

export function ConsentPlaceholder({ vendor, height = "400px", message }: ConsentPlaceholderProps) {
  const text =
    message ??
    `･ﾟ⋆ ${vendor} Content Blocked ･ﾟ⋆\n\nThis ${vendor} embed requires your consent to load external content.\n\nPlease accept Media & External Services in the cookie banner to view this content.`;

  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: typeof height === "number" ? `${height}px` : height,
        padding: "6",
        color: "pageMuted",
        fontFamily: "mono",
        fontSize: "sm",
        textAlign: "center",
        whiteSpace: "pre-line",
        background: "var(--colors-page-muted-bg, rgba(127,127,127,0.06))",
        border: "2px dashed",
        borderColor: "pageBorder",
        borderRadius: "sm",
      }}
    >
      {text}
    </Box>
  );
}
