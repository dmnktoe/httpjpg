import { Box, Paragraph } from "@httpjpg/ui";

interface ConsoleFooterProps {
  lastUpdated?: Date | null;
  message?: string;
}

export function ConsoleFooter({ lastUpdated, message }: ConsoleFooterProps) {
  return (
    <Box
      css={{
        maxW: "2xl",
        mx: "auto",
        w: "full",
        px: { base: 4, md: 6, lg: 8 },
        py: 6,
        borderTop: "1px solid",
        borderColor: "black",
      }}
    >
      {lastUpdated ? (
        <Paragraph css={{ fontSize: "xs", opacity: 0.4, textAlign: "center" }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Paragraph>
      ) : (
        <Paragraph css={{ fontSize: "xs", opacity: 0.4, textAlign: "center" }}>
          {message || "Developer Console · Built with Next.js"}
        </Paragraph>
      )}
    </Box>
  );
}
