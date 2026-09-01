"use client";

import {
  CloudflareLogo,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
} from "@httpjpg/ui";

import type { CloudflareStatusPayload } from "@/lib/integrations/cloudflare";
import { useWidgetData } from "@/lib/use-widget-data";

const CLOUDFLARE_HREF = "https://www.cloudflare.com";

/** Drop the long label and analytics extras below `md` so the lockup + colo still fit. */
const hideOnMobile = { display: { base: "none", md: "block" } } as const;

/**
 * Theme-matched footer line under the live widgets. The lockup is always on;
 * colo, country, blocked threats, and cache ratio append once /api/cloudflare
 * lands. The whole row links out to Cloudflare.
 */
export function CloudflareStatus() {
  const { data } = useWidgetData<CloudflareStatusPayload>("/api/cloudflare");

  return (
    <FooterStatusLine href={CLOUDFLARE_HREF}>
      <FooterStatusLineText fixed dim css={hideOnMobile}>
        backed & secured by
      </FooterStatusLineText>
      <CloudflareLogo />
      {data?.colo && <CloudflareStat>{data.colo}</CloudflareStat>}
      {data?.country && <CloudflareStat>{data.country}</CloudflareStat>}
      {data?.threats ? (
        <CloudflareStat hideOnMobile>
          {`${formatCompactCount(data.threats)} blocked`}
        </CloudflareStat>
      ) : null}
      {data?.cachedRatio != null && (
        <CloudflareStat hideOnMobile>
          {`${Math.round(data.cachedRatio * 100)}% cached`}
        </CloudflareStat>
      )}
    </FooterStatusLine>
  );
}

interface CloudflareStatProps {
  children: string;
  hideOnMobile?: boolean;
}

function CloudflareStat({ children, hideOnMobile: hide }: CloudflareStatProps) {
  const css = hide ? hideOnMobile : undefined;

  return (
    <>
      <FooterStatusLineSeparator css={css} />
      <FooterStatusLineText fixed dim css={css}>
        {children}
      </FooterStatusLineText>
    </>
  );
}

function formatCompactCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
