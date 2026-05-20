import { Box } from "@httpjpg/ui";
import { memo } from "react";

export interface SbMissingProps {
  blok: {
    _uid: string;
    component: string;
    [key: string]: unknown;
  };
}

export const SbMissing = memo(function SbMissing({ blok }: SbMissingProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return (
    <Box
      css={{
        border: "2px dashed",
        borderColor: "danger.500",
        bg: "danger.50",
        color: "danger.700",
        p: "4",
        my: "4",
        borderRadius: "md",
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      Missing Storyblok component:{" "}
      <Box as="code" css={{ fontFamily: "mono" }}>
        {blok.component}
      </Box>
    </Box>
  );
});

SbMissing.displayName = "SbMissing";
