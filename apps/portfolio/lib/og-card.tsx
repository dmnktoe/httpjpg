import { colors } from "@httpjpg/tokens/colors";
import { spacing } from "@httpjpg/tokens/spacing";
import { ASCII_DIVIDER_STARS, ASCII_TAPE } from "@httpjpg/ui";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og-work-meta";

export interface OgCardProps {
  variant: "work" | "page";
  slug: string[];
  title: string;
  titleSize: number;
  year: string;
  isDark: boolean;
  imageUrl: string | null;
  ascii: string | null;
}

export function OgCard({ variant, isDark, ...rest }: OgCardProps) {
  const args: LayoutArgs = { ...rest, p: palette(isDark) };
  return variant === "work" ? <WorkLayout {...args} /> : <PageLayout {...args} />;
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
        fontFamily: "Sans",
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
        fontFamily: "Headline",
        fontSize: size,
        fontWeight: 400,
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
        fontFamily: "Sans",
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

interface LayoutArgs extends Omit<OgCardProps, "variant" | "isDark"> {
  p: Palette;
}

function WorkLayout({ slug, title, titleSize, year, p, imageUrl, ascii }: LayoutArgs) {
  return (
    <div
      style={{
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
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

function PageLayout({ slug, title, titleSize, year, p, imageUrl }: LayoutArgs) {
  return (
    <div
      style={{
        width: OG_CARD_WIDTH,
        height: OG_CARD_HEIGHT,
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

export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;
const PAD = 56;
const IMAGE_RIGHT_GAP = 32;
const PAGE_IMAGE_WIDTH = OG_CARD_WIDTH - PAD * 2;
const PAGE_IMAGE_HEIGHT = 260;
