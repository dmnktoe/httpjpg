import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { readStory } from "@httpjpg/storyblok-next";
import { firstImageFilename } from "@httpjpg/storyblok-utils";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { imageToAscii } from "@/lib/og-ascii";
import { OG_CARD_HEIGHT, OG_CARD_WIDTH, OgCard } from "@/lib/og-card";
import { loadFonts } from "@/lib/og-fonts";
import {
  formatYear,
  OG_ASCII_COLS,
  OG_ASCII_ROWS,
  pickTitleSize,
  toOgAsciiSampleUrl,
  toOgImageUrl,
} from "@/lib/og-work-meta";
import { enforceRateLimit } from "@/lib/rate-limit";

interface PageContent {
  component?: string;
  title?: string;
  isDark?: boolean;
  date?: string;
  images?: Array<{ filename?: string; content_type?: string }>;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  // Each card downloads and rasterises an image: expensive for crawlers.
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  const { slug } = await ctx.params;
  const fullSlug = slug.join("/");
  try {
    const story = await readStory(fullSlug);
    if (!story) {
      return new Response("Not Found", { status: 404 });
    }
    const content = story.content as PageContent | undefined;
    const isWorkPage = content?.component === "work";

    const filename = firstImageFilename(content?.images);
    const imageUrl = filename ? toOgImageUrl(filename) : null;
    const asciiSampleUrl = filename ? toOgAsciiSampleUrl(filename) : null;
    if (filename && (!imageUrl || !asciiSampleUrl)) {
      return new Response("Image source not allowed", { status: 422 });
    }

    const [asciiResult, fonts] = await Promise.all([
      isWorkPage && asciiSampleUrl
        ? imageToAscii(asciiSampleUrl, OG_ASCII_COLS, OG_ASCII_ROWS)
        : Promise.resolve(null),
      loadFonts(),
    ]);

    const rawTitle = content?.title || story.name || "untitled";
    const title = rawTitle.toUpperCase();
    const year = formatYear(content?.date);

    return new ImageResponse(
      <OgCard
        variant={isWorkPage ? "work" : "page"}
        slug={slug}
        title={title}
        titleSize={pickTitleSize(title)}
        year={year}
        isDark={content?.isDark === true}
        imageUrl={imageUrl}
        ascii={asciiResult?.text ?? null}
      />,
      { width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT, fonts },
    );
  } catch (error) {
    captureServerException(error, {
      tags: { route: "og" },
      extra: { slug: fullSlug },
    });
    return new Response("OG generation failed", { status: 500 });
  }
}
