import { Box, Button, Center, Headline, Link, Paragraph } from "@httpjpg/ui";

/**
 * Custom 404 page for portfolio routes
 */
export default function PortfolioNotFound() {
  return (
    <Center minHeight="60vh">
      <Box css={{ textAlign: "center" }}>
        <Headline level={1}>404</Headline>
        <Headline level={2} css={{ mt: "4", mb: "2" }}>
          Page Not Found
        </Headline>
        <Paragraph css={{ mb: "6" }}>
          The page you're looking for doesn't exist or has been moved.
        </Paragraph>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </Box>
    </Center>
  );
}
