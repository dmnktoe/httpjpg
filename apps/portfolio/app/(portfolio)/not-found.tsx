import {
  ASCII_404,
  ASCII_DIVIDER_DOTS,
  AsciiArt,
  Box,
  Button,
  Center,
  Headline,
  Link,
  Paragraph,
  VStack,
} from "@httpjpg/ui";

export default function PortfolioNotFound() {
  return (
    <Center minHeight="60vh">
      <VStack gap="6" align="center">
        <AsciiArt label="404 — page not found" css={{ fontSize: "sm", opacity: 0.85 }}>
          {ASCII_404}
        </AsciiArt>
        <Box css={{ textAlign: "center" }}>
          <Headline level={1}>⇝404⇝</Headline>
          <Headline level={3} css={{ mt: "4", mb: "2", fontFamily: "mono" }}>
            page_not_found
          </Headline>
          <Paragraph css={{ mb: "6", fontFamily: "mono", opacity: 0.7 }}>
            The page you're looking for doesn't exist or has been moved.
          </Paragraph>
          <Box as="span" css={{ fontFamily: "mono", fontSize: "xs", opacity: 0.4 }}>
            {ASCII_DIVIDER_DOTS}
          </Box>
        </Box>
        <Box>
          <Link href="/">
            <Button size="sm">↳ Back to Home</Button>
          </Link>
        </Box>
      </VStack>
    </Center>
  );
}
