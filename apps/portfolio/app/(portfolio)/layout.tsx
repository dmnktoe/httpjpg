/**
 * Provides NO container wrapper - allowing each page to control its own
 * layout using Container/Section components from @httpjpg/ui.
 *
 * Benefits:
 * - Pages can have full-width hero sections
 * - Sections can break out of containers (fullWidth={true})
 * - Mixed container sizes per section (sm, md, lg, xl, 2xl, fluid)
 * - Loading states inherit the same structure
 */
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
