import Script from "next/script";

export interface UmamiAnalyticsProps {
  websiteId: string;
  src?: string;
}

export function UmamiAnalytics({
  websiteId,
  src = "https://cloud.umami.is/script.js",
}: UmamiAnalyticsProps) {
  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
