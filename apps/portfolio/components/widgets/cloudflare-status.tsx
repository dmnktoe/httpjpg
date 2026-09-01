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

/** Threat / cache extras drop below `md` so colo, country, and the lockup still fit. */
const hideOnMobile = { display: { base: "none", md: "block" } } as const;

/**
 * Theme-matched footer line under the live widgets. The lockup is always on;
 * colo and country sit to its left, blocked threats and cache ratio to its
 * right once /api/cloudflare lands. The whole row links out to Cloudflare.
 */
export function CloudflareStatus() {
  const { data } = useWidgetData<CloudflareStatusPayload>("/api/cloudflare");
  const hasLocation = Boolean(data?.colo || data?.country);

  return (
    <FooterStatusLine href={CLOUDFLARE_HREF}>
      {data?.colo && <CloudflareStat separator={false}>{data.colo}</CloudflareStat>}
      {data?.country && (
        <CloudflareStat separator={Boolean(data.colo)}>{data.country}</CloudflareStat>
      )}
      {hasLocation && <FooterStatusLineSeparator />}
      <CloudflareLogo />
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
  /** Leading `·`. Off for the first field so the line does not start with a mark. */
  separator?: boolean;
}

function CloudflareStat({ children, hideOnMobile: hide, separator = true }: CloudflareStatProps) {
  const css = hide ? hideOnMobile : undefined;

  return (
    <>
      {separator && <FooterStatusLineSeparator css={css} />}
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
