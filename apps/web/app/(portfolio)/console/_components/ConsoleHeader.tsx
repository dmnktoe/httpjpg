import { Box, Container, Headline, Link, Paragraph } from "@httpjpg/ui";

interface ConsoleHeaderProps {
  tag: string;
  title: string;
  description: string;
}

export function ConsoleHeader({ tag, title, description }: ConsoleHeaderProps) {
  return (
    <Container
      size="2xl"
      px={{ base: 4, md: 6, lg: 8 }}
      css={{
        py: 6,
        borderBottom: "1px solid",
        borderColor: "black",
      }}
    >
      <Box
        css={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 2,
        }}
      >
        <Link
          href="/console"
          css={{
            fontSize: "sm",
            opacity: 0.6,
            _hover: { opacity: 1 },
          }}
        >
          ← Console
        </Link>
      </Box>
      <Box
        css={{
          fontSize: "sm",
          letterSpacing: "wider",
          opacity: 0.6,
          mb: 2,
        }}
      >
        {tag}
      </Box>
      <Headline
        level={1}
        css={{
          mb: 3,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Headline>
      <Paragraph css={{ maxW: "2xl", opacity: 0.7 }}>{description}</Paragraph>
    </Container>
  );
}
