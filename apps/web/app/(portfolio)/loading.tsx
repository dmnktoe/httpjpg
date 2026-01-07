import { Container, Loading } from "@httpjpg/ui";

/**
 * Portfolio Loading State
 *
 * Matches header width (Container 2xl) and appears directly below it.
 * No padding/margin to align perfectly with header container.
 */
export default function PortfolioLoading() {
  return (
    <Container size="xl" px={{ base: 4, md: 6, lg: 8 }} center={false}>
      <Loading />
    </Container>
  );
}
