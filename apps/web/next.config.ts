import type { NextConfig } from "next";
import withLinaria from "next-with-linaria";

const nextConfig: NextConfig = {
  transpilePackages: ["@httpjpg/ui", "@httpjpg/tokens"],
};

export default withLinaria({
  ...nextConfig,
  linaria: {
    displayName: true,
    classNameSlug: (hash: string, title: string) => {
      return process.env.NODE_ENV === "production"
        ? `httpjpg-${hash}`
        : `httpjpg-${title}-${hash}`;
    },
  },
});
