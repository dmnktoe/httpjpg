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
            opacity: 60,
            _hover: { opacity: 100 },
          }}
        >
          ← Console
        </Link>
      </Box>
      <Box
        css={{
          fontSize: "2xs",
          letterSpacing: "wider",
          opacity: 60,
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
      <Paragraph css={{ maxW: "2xl", opacity: 70 }}>{description}</Paragraph>
    </Container>
  );
}
