"use client";

import { Box } from "@httpjpg/ui";
import { useSyncExternalStore } from "react";

import { formatRelativeTime } from "@/lib/relative-time";

export interface BuildBadgeProps {
  repositoryUrl?: string;
  version?: string;
  buildTime?: string;
  commitSha?: string;
}

export function BuildBadge({ repositoryUrl, version, buildTime, commitSha }: BuildBadgeProps) {
  const now = useSyncExternalStore(subscribeNever, getClientNow, getServerNow);
  const deployedAt = buildTime && now > 0 ? formatRelativeTime(buildTime, now) : null;

  if (!version && !commitSha && !buildTime) {
    return null;
  }

  const shortSha = commitSha ? commitSha.slice(0, SHORT_SHA_LENGTH) : null;
  const href = !repositoryUrl
    ? null
    : commitSha
      ? `${repositoryUrl}/commit/${commitSha}`
      : version
        ? `${repositoryUrl}/releases/tag/${version}`
        : null;

  const content = (
    <>
      <Box as="span" css={{ opacity: 60 }}>
        build:
      </Box>
      {version && (
        <Box as="span" css={{ opacity: 70 }}>
          {version}
        </Box>
      )}
      {shortSha && (
        <>
          <Box as="span" css={{ opacity: 40 }}>
            ·
          </Box>
          <Box as="span" css={{ opacity: 60 }}>
            {shortSha}
          </Box>
        </>
      )}
      {deployedAt && (
        <>
          <Box as="span" css={{ opacity: 40 }}>
            ·
          </Box>
          <Box as="span" css={{ opacity: 50 }}>
            deployed {deployedAt}
          </Box>
        </>
      )}
    </>
  );

  const lineCss = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    minHeight: "5",
    color: "inherit",
    opacity: 80,
    fontFamily: "mono",
    fontSize: "xs",
    textDecoration: "none",
  } as const;

  if (!href) {
    return <Box css={lineCss}>{content}</Box>;
  }

  return (
    <Box as="a" href={href} target="_blank" rel="noopener noreferrer" css={lineCss}>
      {content}
    </Box>
  );
}

const SHORT_SHA_LENGTH = 7;

function subscribeNever() {
  return () => {};
}

let cachedNow = 0;

function getClientNow() {
  cachedNow ||= Date.now();
  return cachedNow;
}

function getServerNow() {
  return 0;
}
