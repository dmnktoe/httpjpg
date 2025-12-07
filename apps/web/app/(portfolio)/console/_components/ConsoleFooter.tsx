import { Container, Paragraph } from "@httpjpg/ui";

interface ConsoleFooterProps {
  lastUpdated?: Date | null;
  message?: string;
}

export function ConsoleFooter({ lastUpdated, message }: ConsoleFooterProps) {
  return (
    <Container
      size="2xl"
      px={{ base: 4, md: 6, lg: 8 }}
      css={{
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
    </Container>
  );
}
