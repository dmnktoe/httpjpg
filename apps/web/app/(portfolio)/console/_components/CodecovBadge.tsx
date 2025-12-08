"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

interface CodecovData {
  coverage: number;
  url: string;
}

export function CodecovBadge() {
  const [data, setData] = useState<CodecovData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch codecov data from API
    fetch("/api/codecov")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box
        css={{
          display: "inline-block",
          fontSize: "xs",
          fontFamily: "mono",
          background: "white",
          color: "neutral.500",
        }}
      >
        ░░ COV...
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const coverage = data.coverage || 0;
  const coverageColor =
    coverage >= 80 ? "#22c55e" : coverage >= 60 ? "#eab308" : "#ef4444";

  const coverageText =
    coverage >= 80
      ? `⋆.˚ ᡣ𐭩 .𖥔˚ ${coverage.toFixed(1)}% 𝒸ₒᵥₑᵣₐ𝑔ₑ ⋆.˚✮✮˚.⋆`
      : coverage >= 60
        ? `░░ ${coverage.toFixed(1)}% 𝒸ₒᵥₑᵣₐ𝑔ₑ ░░`
        : `╭────╮ ${coverage.toFixed(1)}% 𝒸ₒᵥₑᵣₐ𝑔ₑ ╰────╯`;

  return (
    <Box
      css={{
        display: "inline-block",
        fontSize: "xs",
        fontFamily: "mono",
        background: "white",
        color: coverageColor,
      }}
    >
      {coverageText}
    </Box>
  );
}
