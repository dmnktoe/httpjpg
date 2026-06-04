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
        my: "4",
        p: "4",
        color: "danger.700",
        fontFamily: "mono",
        fontSize: "sm",
        bg: "danger.50",
        border: "2px dashed",
        borderColor: "danger.500",
        borderRadius: "md",
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
