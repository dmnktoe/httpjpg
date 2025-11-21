import { PreviewNotification } from "../components/preview-notification";

/**
 * Layout for all portfolio routes
 * Includes draft mode preview notification
 */
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PreviewNotification />
      {children}
    </>
  );
}
