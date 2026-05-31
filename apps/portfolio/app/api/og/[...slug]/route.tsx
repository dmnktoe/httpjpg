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
const PAD = 56;
const IMAGE_RIGHT_GAP = 32;

interface FontSpec {
  family: string;
  cssUrl: string;
  satoriName: string;
}

// Noto subsets cover the ASCII_DIVIDER_STARS / ASCII_TAPE glyphs Inter can't.
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

// Shared in-flight promise; cleared on failure so the next request retries.
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

interface PageContent {
  component?: string;
  title?: string;
  isDark?: boolean;
  date?: string;
  images?: Array<{ filename?: string; content_type?: string }>;
}

interface Palette {
  fg: string;
  bg: string;
  muted: string;
}

function palette(isDark: boolean): Palette {
  return {
    fg: isDark ? colors.white : colors.black,
    bg: isDark ? colors.black : colors.white,
    muted: isDark ? colors.neutral[400] : colors.neutral[600],
  };
}

function Masthead({ year, slug, p }: { year: string; slug: string[]; p: Palette }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingBottom: spacing[3],
        borderBottom: `2px solid ${p.fg}`,
        fontSize: 26,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <span>HTTPJPG</span>
      <span style={{ color: p.muted, fontSize: 22, letterSpacing: "0.22em" }}>
        {year || slug.join(" / ")}
      </span>
    </div>
  );
}

function Headline({ title, size, p }: { title: string; size: number; p: Palette }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.02em",
        textTransform: "uppercase",
        color: p.fg,
        wordBreak: "break-word",
        marginTop: spacing[6],
      }}
    >
      {title}
    </div>
  );
}

function Footer({ slug, p, prefix }: { slug: string[]; p: Palette; prefix: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingTop: spacing[3],
        borderTop: `2px solid ${p.fg}`,
        fontSize: 22,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: p.fg,
      }}
    >
      <span>
        {prefix}
        {slug.join("/").toUpperCase()}
      </span>
      <span
        style={{
          display: "flex",
          gap: 16,
          alignItems: "baseline",
          color: p.muted,
          letterSpacing: "0.05em",
        }}
      >
        <span>{ASCII_TAPE}</span>
        <span style={{ letterSpacing: "0.1em" }}>HTTPJPG.COM</span>
      </span>
    </div>
  );
}

function Divider({ p }: { p: Palette }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontSize: 22,
        letterSpacing: "0.2em",
        color: p.muted,
        marginBottom: spacing[5],
      }}
    >
      {ASCII_DIVIDER_STARS}
    </div>
  );
}

interface LayoutArgs {
  slug: string[];
  title: string;
  titleSize: number;
  year: string;
  p: Palette;
  imageUrl: string | null;
  ascii: string | null;
}

function WorkLayout({ slug, title, titleSize, year, p, imageUrl, ascii }: LayoutArgs) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: p.bg,
        color: p.fg,
        display: "flex",
        flexDirection: "column",
        padding: PAD,
        position: "relative",
      }}
    >
      <Masthead year={year} slug={slug} p={p} />
      <Headline title={title} size={titleSize} p={p} />
      <div
        style={{
          display: "flex",
          position: "relative",
          marginTop: spacing[6],
          height: OG_IMAGE_HEIGHT,
        }}
      >
        {imageUrl && (
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
        )}
        {ascii && (
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
              color: p.muted,
              opacity: 0.6,
            }}
          >
            {ascii}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flex: 1 }} />
      <Divider p={p} />
      <Footer slug={slug} p={p} prefix="/WORK/" />
    </div>
  );
}

const PAGE_IMAGE_WIDTH = WIDTH - PAD * 2;
const PAGE_IMAGE_HEIGHT = 260;

function PageLayout({ slug, title, titleSize, year, p, imageUrl }: LayoutArgs) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: p.bg,
        color: p.fg,
        display: "flex",
        flexDirection: "column",
        padding: PAD,
        position: "relative",
      }}
    >
      <Masthead year={year} slug={slug} p={p} />
      <Headline title={title} size={titleSize} p={p} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          width={PAGE_IMAGE_WIDTH}
          height={PAGE_IMAGE_HEIGHT}
          style={{
            marginTop: spacing[6],
            width: PAGE_IMAGE_WIDTH,
            height: PAGE_IMAGE_HEIGHT,
            objectFit: "cover",
          }}
        />
      )}
      <div style={{ display: "flex", flex: 1 }} />
      <Divider p={p} />
      <Footer slug={slug} p={p} prefix="/" />
    </div>
  );
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  const fullSlug = slug.join("/");
  try {
    const story = await fetchStory(fullSlug, { draftMode: false });
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
    const p = palette(content?.isDark === true);
    const titleSize = pickTitleSize(title);

    const layoutArgs: LayoutArgs = {
      slug,
      title,
      titleSize,
      year,
      p,
      imageUrl,
      ascii: asciiResult?.text ?? null,
    };

    return new ImageResponse(
      isWorkPage ? <WorkLayout {...layoutArgs} /> : <PageLayout {...layoutArgs} />,
      { width: WIDTH, height: HEIGHT, fonts },
    );
  } catch (error) {
    captureServerException(error, {
      tags: { route: "og" },
      extra: { slug: fullSlug },
    });
    return new Response("OG generation failed", { status: 500 });
  }
}
