import {
  AspectRatio,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  GridItem,
  Headline,
  Image,
  Paragraph,
  Section,
  VStack,
} from "@httpjpg/ui";
import { InteractiveButtons } from "./InteractiveButtons";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <Section pt="20" pb="20" fullWidth>
        <Container size="lg" center>
          <Center minHeight="60vh">
            <VStack gap="8" align="center">
              <Headline level={1}>Welcome to httpjpg</Headline>
              <Paragraph size="lg" align="center" maxWidth>
                A modern design system built with Panda CSS, featuring brutalist
                aesthetics and zero-runtime performance.
              </Paragraph>
              <InteractiveButtons />
            </VStack>
          </Center>
        </Container>
      </Section>

      <Divider variant="solid" />

      {/* Typography Section */}
      <Section pt="16" pb="16">
        <Container size="lg" center>
          <VStack gap="8">
            <Headline level={2}>Typography System</Headline>
            <Paragraph size="lg">
              Our typography system features fluid, responsive scaling that
              adapts to different screen sizes while maintaining optimal
              readability.
            </Paragraph>

            <VStack gap="4">
              <Headline level={1}>Heading Level 1</Headline>
              <Headline level={2}>Heading Level 2</Headline>
              <Headline level={3}>Heading Level 3</Headline>
              <Headline level={3} as="h4">
                Heading Level 4 (styled as h3)
              </Headline>
              <Headline level={3} as="h5">
                Heading Level 5 (styled as h3)
              </Headline>
              <Headline level={3} as="h6">
                Heading Level 6 (styled as h3)
              </Headline>
            </VStack>

            <VStack gap="4">
              <Paragraph size="lg">
                Large paragraph: Perfect for introductory text and emphasis. The
                quick brown fox jumps over the lazy dog.
              </Paragraph>
              <Paragraph size="md">
                Medium paragraph (default): Ideal for body text with optimal
                line height and spacing. The quick brown fox jumps over the lazy
                dog.
              </Paragraph>
              <Paragraph size="sm">
                Small paragraph: Great for captions and supporting text. The
                quick brown fox jumps over the lazy dog.
              </Paragraph>
            </VStack>
          </VStack>
        </Container>
      </Section>

      <Divider variant="ascii" />

      {/* Button Variants Section */}
      <Section pt="16" pb="16">
        <Container size="lg" center>
          <VStack gap="8">
            <Headline level={2}>Button Components</Headline>
            <Paragraph>
              Interactive buttons in multiple variants and sizes, built with
              Panda CSS variants.
            </Paragraph>

            <VStack gap="6">
              <Box>
                <Headline level={3}>Variants</Headline>
                <InteractiveButtons />
              </Box>

              <Box>
                <Headline level={3}>Sizes</Headline>
                <VStack gap="4">
                  <Button size="sm">Small Button</Button>
                  <Button size="md">Medium Button</Button>
                  <Button size="lg">Large Button</Button>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Section>

      <Divider variant="solid" color="neutral.300" />

      {/* Grid Layout Section */}
      <Section pt="16" pb="16">
        <Container size="lg" center>
          <VStack gap="8">
            <Headline level={2}>Grid System</Headline>
            <Paragraph>
              A powerful 12-column grid system with flexible gap controls and
              responsive layouts.
            </Paragraph>

            <Grid columns={3} gap="6">
              <GridItem>
                <Box
                  css={{
                    bg: "neutral.100",
                    p: "6",
                    borderRadius: "md",
                  }}
                >
                  <Headline level={3}>Feature One</Headline>
                  <Paragraph size="sm">
                    Panda CSS provides zero-runtime styling with full TypeScript
                    support.
                  </Paragraph>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  css={{
                    bg: "neutral.100",
                    p: "6",
                    borderRadius: "md",
                  }}
                >
                  <Headline level={3}>Feature Two</Headline>
                  <Paragraph size="sm">
                    Responsive design tokens ensure consistency across all
                    components.
                  </Paragraph>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  css={{
                    bg: "neutral.100",
                    p: "6",
                    borderRadius: "md",
                  }}
                >
                  <Headline level={3}>Feature Three</Headline>
                  <Paragraph size="sm">
                    Brutalist aesthetics meet modern web performance standards.
                  </Paragraph>
                </Box>
              </GridItem>
            </Grid>

            <Box css={{ mt: "8" }}>
              <Headline level={3}>Spanning Columns</Headline>
              <Grid columns={6} gap="4">
                <GridItem colSpan={2}>
                  <Box css={{ bg: "accent.400", p: "4", color: "white" }}>
                    Span 2
                  </Box>
                </GridItem>
                <GridItem colSpan={4}>
                  <Box css={{ bg: "accent.500", p: "4", color: "white" }}>
                    Span 4
                  </Box>
                </GridItem>
                <GridItem colSpan={3}>
                  <Box css={{ bg: "accent.600", p: "4", color: "white" }}>
                    Span 3
                  </Box>
                </GridItem>
                <GridItem colSpan={3}>
                  <Box css={{ bg: "accent.700", p: "4", color: "white" }}>
                    Span 3
                  </Box>
                </GridItem>
              </Grid>
            </Box>
          </VStack>
        </Container>
      </Section>

      <Divider variant="ascii" />

      {/* Image Section */}
      <Section pt="16" pb="16">
        <Container size="lg" center>
          <VStack gap="8">
            <Headline level={2}>Image Component</Headline>
            <Paragraph>
              Responsive images with aspect ratio control and copyright
              information.
            </Paragraph>

            <Grid columns={2} gap="6">
              <GridItem>
                <AspectRatio ratio="16/9">
                  <Image
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
                    alt="Abstract architecture"
                    copyright="Photo by Unsplash"
                    copyrightPosition="overlay"
                  />
                </AspectRatio>
              </GridItem>
              <GridItem>
                <AspectRatio ratio="1/1">
                  <Image
                    src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&q=80"
                    alt="Modern design"
                    copyright="Photo by Unsplash"
                    copyrightPosition="overlay"
                  />
                </AspectRatio>
              </GridItem>
            </Grid>
          </VStack>
        </Container>
      </Section>

      <Divider variant="solid" />

      {/* Footer Section */}
      <Section pt="12" pb="12">
        <Container size="lg" center>
          <Center>
            <VStack gap="4" align="center">
              <Headline level={3}>Built with Modern Tools</Headline>
              <Paragraph align="center">
                Next.js 15 • Panda CSS • TypeScript • Turborepo
              </Paragraph>
              <Paragraph size="sm" align="center">
                Zero-runtime styling with type-safe design tokens
              </Paragraph>
            </VStack>
          </Center>
        </Container>
      </Section>
    </main>
  );
}
