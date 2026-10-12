import { colors } from "@httpjpg/tokens/colors";
import type { MetadataRoute } from "next";

import { getSeoDefaults, getSiteConfig } from "@/lib/queries/config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [site, seo] = await Promise.all([getSiteConfig(), getSeoDefaults()]);
  const name = seo.title || site.name || "";
  return {
    name,
    short_name: site.name || name,
    description: seo.description,
    start_url: "/",
    display: "browser",
    background_color: colors.white,
    theme_color: colors.black,
    ...(site.htmlLang ? { lang: site.htmlLang } : {}),
    icons: [{ src: "/icon.png", sizes: "254x254", type: "image/png" }],
  };
}
