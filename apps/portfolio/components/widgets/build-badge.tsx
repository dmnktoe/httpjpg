"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import { config } from "@/lib/config";
import { formatRelativeTime } from "@/lib/relative-time";

const SHORT_SHA_LENGTH = 7;

export interface BuildBadgeProps {
  version?: string;
  buildTime?: string;
  commitSha?: string;
}

export function BuildBadge({ version, buildTime, commitSha }: BuildBadgeProps) {
  const [deployedAt, setDeployedAt] = useState<string | null>(null);

  useEffect(() => {
    if (buildTime) {
      setDeployedAt(formatRelativeTime(buildTime, Date.now()));
    }
  }, [buildTime]);

  if (!version && !commitSha && !buildTime) {
    return null;
  }

  const shortSha = commitSha ? commitSha.slice(0, SHORT_SHA_LENGTH) : null;
  const href = commitSha
    ? `${config.repositoryUrl}/commit/${commitSha}`
    : version
      ? `${config.repositoryUrl}/releases/tag/${version}`
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
