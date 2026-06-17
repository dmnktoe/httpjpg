import {
  ASCII_DIVIDER_ARROWS,
  ASCII_GHOST,
  AsciiArt,
  Box,
  Headline,
  Link,
  Paragraph,
} from "@httpjpg/ui";

import { ThemeSync } from "@/components/ui/theme-sync";

export function NotFoundScreen() {
  return (
    <>
      <ThemeSync theme="light" />
      <Box css={{ px: { base: "4", md: "8" }, py: { base: "12", md: "20" } }}>
        <Headline as="h1" css={{ fontSize: { base: "6xl", md: "8xl" } }}>
          404
        </Headline>
        <Paragraph css={{ mt: "4", fontFamily: "mono" }}>
          ↳ this page never existed, or was erased ⋆.˚
        </Paragraph>
        <AsciiArt
          label="ghost icon"
          css={{ mt: "6", opacity: 0.6, fontSize: "sm", textAlign: "left" }}
        >
          {ASCII_GHOST}
        </AsciiArt>
        <Box
          as="span"
          css={{ display: "block", mt: "6", opacity: 0.35, fontFamily: "mono", fontSize: "xs" }}
        >
          {ASCII_DIVIDER_ARROWS}
        </Box>
        <Box css={{ mt: "8", fontFamily: "mono", fontSize: "sm" }}>
          <Link href="/">← back to /</Link>
        </Box>
      </Box>
    </>
  );
}
