import {
  Box,
  Button,
  Container,
  Headline,
  Link,
  Page,
  Paragraph,
  Section,
} from "@httpjpg/ui";

/**
 * Test Page - Mock page for E2E tests
 * This page doesn't depend on Storyblok CMS and provides
 * consistent content for accessibility and navigation tests
 * Uses real UI components from @httpjpg/ui package
 */
export default function TestPage() {
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Test Page", href: "/test-page" },
    { name: "About", href: "/about" },
  ];

  return (
    <Page
      header={{
        nav: navItems,
        personalWork: [
          {
            id: "test-work-1",
            slug: "test-project",
            title: "Test Project",
            imageUrl: "https://via.placeholder.com/400x300",
          },
        ],
        clientWork: [],
      }}
      footer={{
        showDefaultLinks: true,
        copyrightText: "© 2025 httpjpg Test",
      }}
    >
      <Container>
        <Section>
          <Headline level={1}>Test Page</Headline>
          <Paragraph>
            This is a test page with proper semantic HTML structure built with
            @httpjpg/ui components.
          </Paragraph>
        </Section>

        <Section>
          <Headline level={2}>Interactive Elements</Headline>
          <Box css={{ display: "flex", gap: "4", alignItems: "center" }}>
            <Button variant="primary">Test Button</Button>
            <Link href="#test">Test Link</Link>
          </Box>
        </Section>

        <Section>
          <Headline level={3}>Content Section</Headline>
          <Paragraph>
            Testing accessibility, navigation, and responsive design with real
            UI components.
          </Paragraph>
        </Section>
      </Container>
    </Page>
  );
}

export const metadata = {
  title: "Test Page - E2E Testing",
  description: "Mock page for E2E tests with @httpjpg/ui components",
};
