"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

interface CIStatus {
  status: string;
  html_url: string;
}

export function CIStatusBadge() {
  const [status, setStatus] = useState<CIStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github-status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box
        css={{
          display: "inline-block",
          fontSize: "sm",
          fontFamily: "mono",
          background: "white",
          color: "neutral.500",
        }}
      >
        ░░ CI...
      </Box>
    );
  }

  if (!status || status.status === "error") {
    return null;
  }

  const statusText =
    status.status === "success"
      ? "✧･ﾟ: *✧･ﾟ:* CI ₚₐₛₛᵢₙ𝑔 *:･ﾟ✧*:･ﾟ✧"
      : status.status === "failure"
        ? "⚠︎⚠︎⚠︎ CI 𝒻ₐᵢₗᵢₙ𝑔 ⚠︎⚠︎⚠︎"
        : "⟡ ⟡ ⟡ CI ₚₑₙ𝒹ᵢₙ𝑔 ⟡ ⟡ ⟡";

  const statusColor =
    status.status === "success"
      ? "success.500"
      : status.status === "failure"
        ? "danger.500"
        : "warning.500";

  return (
    <Box
      css={{
        display: "inline-block",
        fontSize: "sm",
        fontFamily: "mono",
        background: "white",
        color: statusColor,
      }}
    >
      {statusText}
    </Box>
  );
}
