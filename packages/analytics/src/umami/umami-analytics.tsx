import Script from "next/script";

export interface UmamiAnalyticsProps {
  websiteId: string;
  src: string;
}

export function UmamiAnalytics({ websiteId, src }: UmamiAnalyticsProps) {
  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
