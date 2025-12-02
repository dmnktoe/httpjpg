/**
 * Portfolio Routes Layout
 *
 * This layout wraps all portfolio-related pages (work items, projects, etc.)
 * It provides NO container wrapper - allowing each page to control its own
 * layout using Container/Section components from @httpjpg/ui.
 *
 * Benefits:
 * - Pages can have full-width hero sections
 * - Sections can break out of containers (fullWidth={true})
 * - Mixed container sizes per section (sm, md, lg, xl, 2xl, fluid)
 * - Loading states inherit the same structure
 *
 * @example Page structure:
 * ```tsx
 * <Section pt={0} pb={16} fullWidth containerSize="2xl">
 *   <Container size="lg">
 *     <Headline>Title</Headline>
 *   </Container>
 * </Section>
 *
 * <Section pt={16} pb={16} fullWidth={true} useContainer={false}>
 *   <FullWidthImage />
 * </Section>
 * ```
 */
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
