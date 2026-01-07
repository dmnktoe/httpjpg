import { config } from "@httpjpg/config";
import { Container, Loading } from "@httpjpg/ui";

/**
 * Portfolio Loading State
 *
 * Disabled when phpLikeNavigation is enabled (full page reloads use browser's native indicator)
 * Shown when phpLikeNavigation is disabled (modern SPA with client-side navigation)
 */
export default function PortfolioLoading() {
  if (config.features.phpLikeNavigation) {
    return null;
  }

  return (
    <Container size="xl" px={{ base: 4, md: 6, lg: 8 }} center={false}>
      <Loading />
    </Container>
  );
}
