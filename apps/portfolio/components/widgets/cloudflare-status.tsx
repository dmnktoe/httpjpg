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

/**
 * Theme-matched footer line under the live widgets. The lockup is always on;
 * colo, country, blocked threats, and cache ratio append once /api/cloudflare
 * lands. The whole row links out to Cloudflare.
 */
export function CloudflareStatus() {
  const { data } = useWidgetData<CloudflareStatusPayload>("/api/cloudflare");

  return (
    <FooterStatusLine href={CLOUDFLARE_HREF}>
      <FooterStatusLineText fixed dim>
        backed & secured by
      </FooterStatusLineText>
      <CloudflareLogo />
      {data?.colo && <CloudflareStat>{data.colo}</CloudflareStat>}
      {data?.country && <CloudflareStat>{data.country}</CloudflareStat>}
      {data?.threats ? (
        <CloudflareStat>{`${formatCompactCount(data.threats)} blocked`}</CloudflareStat>
      ) : null}
      {data?.cachedRatio != null && (
        <CloudflareStat>{`${Math.round(data.cachedRatio * 100)}% cached`}</CloudflareStat>
      )}
    </FooterStatusLine>
  );
}

interface CloudflareStatProps {
  children: string;
}

function CloudflareStat({ children }: CloudflareStatProps) {
  return (
    <>
      <FooterStatusLineSeparator />
      <FooterStatusLineText fixed dim>
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
