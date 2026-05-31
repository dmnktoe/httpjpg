import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { fetchStory } from "@httpjpg/storyblok-next";
import { firstImageFilename } from "@httpjpg/storyblok-utils";
import { colors } from "@httpjpg/tokens/colors";
import { spacing } from "@httpjpg/tokens/spacing";
import { ASCII_DIVIDER_STARS, ASCII_TAPE } from "@httpjpg/ui";
import { ImageResponse } from "next/og";

import { imageToAscii } from "@/lib/og-ascii";
import {
  formatYear,
  OG_ASCII_COLS,
  OG_ASCII_ROWS,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  pickTitleSize,
  toOgAsciiSampleUrl,
  toOgImageUrl,
} from "@/lib/og-work-meta";

export const runtime = "nodejs";
export const revalidate = 3600;

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 56; // matches spacing[14]
const IMAGE_RIGHT_GAP = 32;

interface FontSpec {
  family: string;
  cssUrl: string;
  satoriName: string;
}

// Inter first = Satori's default for text; Noto subsets cover the
// mixed-script glyphs in ASCII_DIVIDER_STARS / ASCII_TAPE.
const FONT_SPECS: readonly FontSpec[] = [
  {
    family: "Inter",
    cssUrl: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
    satoriName: "Sans",
  },
  {
    family: "Noto Sans Mono",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Mono&display=swap",
    satoriName: "NotoMono",
  },
  {
    family: "Noto Sans Symbols 2",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap",
    satoriName: "NotoSymbols",
  },
  {
    family: "Noto Serif Tibetan",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan&display=swap",
    satoriName: "NotoTibetan",
  },
  {
    family: "Noto Sans Gurmukhi",
    cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi&display=swap",
    satoriName: "NotoGurmukhi",
  },
];

interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

// Cache the in-flight promise so concurrent cold-start requests share a
// single round of font fetches instead of racing to populate the cache.
// Reset to null on failure so subsequent requests get a clean retry.
let fontsPromise: Promise<SatoriFont[]> | null = null;

function loadFonts(): Promise<SatoriFont[]> {
  if (fontsPromise) {
    return fontsPromise;
  }
  const promise = Promise.all(
    FONT_SPECS.map(async ({ family, cssUrl, satoriName }): Promise<SatoriFont> => {
      const cssRes = await fetch(cssUrl);
      if (!cssRes.ok) {
        throw new Error(`og/work: ${family} CSS fetch failed (${cssRes.status})`);
      }
      const css = await cssRes.text();
      const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
      if (!match) {
        throw new Error(`og/work: ${family} TTF URL not found in CSS`);
      }
      const fontRes = await fetch(match[1]!);
      if (!fontRes.ok) {
        throw new Error(`og/work: ${family} binary fetch failed (${fontRes.status})`);
      }
      return {
        name: satoriName,
        data: await fontRes.arrayBuffer(),
        weight: 400,
        style: "normal",
      };
    }),
  ).catch((err) => {
    fontsPromise = null;
    throw err;
  });
  fontsPromise = promise;
  return promise;
}

interface WorkContent {
  component?: string;
  title?: string;
  isDark?: boolean;
  date?: string;
  images?: Array<{ filename?: string; content_type?: string }>;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  const fullSlug = `work/${slug.join("/")}`;
  try {
    const story = await fetchStory(fullSlug, { draftMode: false });
    if (!story) {
      return new Response("Not Found", { status: 404 });
    }
    const content = story.content as WorkContent | undefined;
    if (content?.component !== "work") {
      return new Response("Not a work page", { status: 404 });
    }
    const filename = firstImageFilename(content.images);
    if (!filename) {
      return new Response("No image available", { status: 404 });
    }

    const imageUrl = toOgImageUrl(filename);
    const asciiSampleUrl = toOgAsciiSampleUrl(filename);
    if (!imageUrl || !asciiSampleUrl) {
      return new Response("Image source not allowed", { status: 422 });
    }

    const [{ text: ascii }, fonts] = await Promise.all([
      imageToAscii(asciiSampleUrl, OG_ASCII_COLS, OG_ASCII_ROWS),
      loadFonts(),
    ]);

    const rawTitle = content.title || story.name || "untitled";
    const title = rawTitle.toUpperCase();
    const year = formatYear(content.date);
    const isDark = content.isDark === true;

    const fg = isDark ? colors.white : colors.black;
    const bg = isDark ? colors.black : colors.white;
    const muted = isDark ? colors.neutral[400] : colors.neutral[600];

    const titleSize = pickTitleSize(title);

    return new ImageResponse(
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: bg,
          color: fg,
          display: "flex",
          flexDirection: "column",
          padding: PAD,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: spacing[3],
            borderBottom: `2px solid ${fg}`,
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>HTTPJPG</span>
          <span style={{ color: muted, fontSize: 22, letterSpacing: "0.22em" }}>
            {year || slug.join(" / ")}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: fg,
            wordBreak: "break-word",
            marginTop: spacing[6],
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: spacing[6],
            height: OG_IMAGE_HEIGHT,
          }}
        >
          <img
            src={imageUrl}
            alt=""
            width={OG_IMAGE_WIDTH}
            height={OG_IMAGE_HEIGHT}
            style={{
              marginLeft: "auto",
              marginRight: IMAGE_RIGHT_GAP,
              width: OG_IMAGE_WIDTH,
              height: OG_IMAGE_HEIGHT,
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              display: "flex",
              fontFamily: "NotoMono",
              fontSize: 12,
              lineHeight: 1,
              letterSpacing: 0,
              whiteSpace: "pre",
              color: muted,
              opacity: 0.6,
            }}
          >
            {ascii}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 22,
            letterSpacing: "0.2em",
            color: muted,
            marginBottom: spacing[5],
          }}
        >
          {ASCII_DIVIDER_STARS}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: spacing[3],
            borderTop: `2px solid ${fg}`,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: fg,
          }}
        >
          <span>/WORK/{slug.join("/").toUpperCase()}</span>
          <span
            style={{
              display: "flex",
              gap: 16,
              alignItems: "baseline",
              color: muted,
              letterSpacing: "0.05em",
            }}
          >
            <span>{ASCII_TAPE}</span>
            <span style={{ letterSpacing: "0.1em" }}>HTTPJPG.COM</span>
          </span>
        </div>
      </div>,
      { width: WIDTH, height: HEIGHT, fonts },
    );
  } catch (error) {
    captureServerException(error, {
      tags: { route: "og/work" },
      extra: { slug: fullSlug },
    });
    return new Response("OG generation failed", { status: 500 });
  }
}
