import {
  Box,
  Button,
  Center,
  Headline,
  Link,
  Paragraph,
  VStack,
} from "@httpjpg/ui";

/**
 * Custom 404 page for portfolio routes
 */
export default function PortfolioNotFound() {
  return (
    <Center minHeight="60vh">
      <VStack gap="8" align="center">
        <Box css={{ textAlign: "center" }}>
          <Headline level={1}>⇝404⇝</Headline>
          <Headline level={3} css={{ mt: "4", mb: "2" }}>
            page_not_found
          </Headline>
          <Paragraph css={{ mb: "6" }}>
            The page you're looking for doesn't exist or has been moved.
          </Paragraph>
        </Box>
        <Box>
          <Link href="/">
            <Button size="sm">Back to Home</Button>
          </Link>
        </Box>
      </VStack>
    </Center>
  );
}
