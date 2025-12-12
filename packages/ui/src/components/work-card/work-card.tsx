"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { AnimateInView } from "../animate-in-view";
import { Box } from "../box/box";
import { Icon } from "../icon/icon";
import { Link } from "../link/link";
import { Paragraph } from "../paragraph/paragraph";
import { Slideshow, type SlideshowImage } from "../slideshow/slideshow";
import { HStack, VStack } from "../stack";

export interface WorkCardProps {
  /**
   * Project title
   */
  title: string;
  /**
   * Project description (can be rich text)
   */
  description?: ReactNode;
  /**
   * Project date (ISO string or Date)
   */
  date?: string | Date;
  /**
   * Project images for slideshow
   */
  images: SlideshowImage[];
  /**
   * Project slug for link
   */
  slug: string;
  /**
   * Base URL for project links
   * @default "/work"
   */
  baseUrl?: string;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Month symbols for creative display
 */
const MONTH_SYMBOLS: Record<number, string> = {
  0: "❄", // Januar - Snowflake
  1: "❤", // Februar - Heart
  2: "🌱", // März - Seedling
  3: "🌸", // April - Blossom
  4: "☀", // Mai - Sun
  5: "🌊", // Juni - Wave
  6: "🔥", // Juli - Fire
  7: "🌾", // August - Grain
  8: "🍂", // September - Falling leaf
  9: "🎃", // Oktober - Pumpkin
  10: "🍁", // November - Maple leaf
  11: "✨", // Dezember - Sparkles
};

/**
 * Format date parts
 */
function formatWorkCardDate(date: string | Date): {
  day: string;
  month: string;
  year: string;
  monthSymbol: string;
} {
  const dateObj = new Date(date);
  const parts = new Intl.DateTimeFormat("de-DE", {
    year: "2-digit",
    month: "narrow",
    day: "2-digit",
  }).formatToParts(dateObj);

  return {
    day: parts.find((p) => p.type === "day")?.value || "",
    month: parts.find((p) => p.type === "month")?.value || "",
    year: parts.find((p) => p.type === "year")?.value || "",
    monthSymbol: MONTH_SYMBOLS[dateObj.getMonth()] || "●",
  };
}

/**
 * WorkCard Date component
 */
function WorkCardDate({ date }: { date: string | Date }) {
  const { day, month, year, monthSymbol } = formatWorkCardDate(date);

  return (
    <HStack
      gap="2"
      align="center"
      css={{
        fontFamily: "mono",
        fontSize: "sm", // token: fontSizes.sm (12px)
        mb: "4px",
      }}
    >
      <Box css={{ opacity: 0.5 }}>╱╱</Box>
      <Box css={{ letterSpacing: "wider" }}>
        {day}.
        <Box
          as="span"
          css={{
            fontFamily: "system-ui",
            fontSize: "md",
            mx: "1",
            position: "relative",
            top: "1px",
          }}
        >
          {monthSymbol} {month}
        </Box>
        {year}
      </Box>
      <Box css={{ opacity: 0.3, fontSize: "0.65rem" }}>⌘ρτ</Box>
    </HStack>
  );
}

/**
 * WorkCard Title component
 */
function WorkCardTitle({ title }: { title: string }) {
  return (
    <Box
      css={{
        w: { base: "full", xl: "1/2" },
        mt: { base: "-12px", md: "-24px", xl: "-5vw" },
        "@media (min-width: 1536px)": {
          ml: "-24px",
          mr: "24px",
        },
      }}
    >
      <Box
        css={{
          textAlign: "right",
          fontSize: { base: "8.5vw", xl: "6vw" },
          lineHeight: 0.8,
          letterSpacing: "tighter",
        }}
      >
        <AnimateInView animation="fadeIn" delay={0.5} once={true}>
          <Box as="span" css={{ display: "inline-block" }}>
            <Icon
              name="arrow-up"
              size="7.5vw"
              css={{
                position: "relative",
                top: "0.8vw",
                transform: "rotate(90deg)",
                "@media (min-width: 1280px)": {
                  width: "5.5vw",
                  top: "1.62vw",
                },
              }}
            />
          </Box>
          {title}
        </AnimateInView>
      </Box>
    </Box>
  );
}

/**
 * WorkCard Meta component (Date & Link)
 */
function WorkCardMeta({
  date,
  slug,
  baseUrl,
}: {
  date?: string | Date;
  slug: string;
  baseUrl: string;
}) {
  return (
    <Box>
      {date && <WorkCardDate date={date} />}
      <Box>
        <Link
          href={`${baseUrl}/${slug}`}
          css={{
            fontSize: "sm",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            color: "primary.500",
            textDecoration: "none",
            _hover: {
              textDecoration: "underline",
            },
          }}
        >
          -̸̨̱̠̳̩̼͙̈̀̀̄̃̆́͠ͅ↳↳↳{slug}↳↳↳
        </Link>
      </Box>
    </Box>
  );
}

/**
 * WorkCard Content component (Description & Meta)
 */
function WorkCardContent({
  description,
  date,
  slug,
  baseUrl,
}: {
  description?: ReactNode;
  date?: string | Date;
  slug: string;
  baseUrl: string;
}) {
  return (
    <Box css={{ w: { base: "full", xl: "1/2" } }}>
      <VStack
        gap="4"
        css={{
          mx: "auto",
          w: { base: "full", md: "10/12", xl: "full" },
        }}
      >
        {description && (
          <Paragraph
            size="sm"
            css={
              {
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: { base: 5, xl: "none" },
                WebkitBoxOrient: "vertical",
              } as any
            }
          >
            {description}
          </Paragraph>
        )}
        <WorkCardMeta date={date} slug={slug} baseUrl={baseUrl} />
      </VStack>
    </Box>
  );
}

/**
 * WorkCard component - Project showcase card
 *
 * Displays a project with slideshow, animated title, description, date,
 * and link. Perfect for portfolio work lists.
 *
 * @example
 * ```tsx
 * <WorkCard
 *   title="Brand Identity"
 *   description={<p>Modern brand identity for tech startup</p>}
 *   date="2024-03-15"
 *   images={[{ url: "/project1.jpg", alt: "Project image" }]}
 *   slug="brand-identity"
 * />
 * ```
 */
export const WorkCard = forwardRef<HTMLDivElement, WorkCardProps>(
  (
    {
      title,
      description,
      date,
      images,
      slug,
      baseUrl = "/work",
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "2", // token: spacing[8] (8px)
          ...cssProp,
        }}
        {...props}
      >
        {/* Slideshow */}
        <Box
          css={{
            zIndex: 10,
            px: { base: 0, xl: "192px" },
            "@media (min-width: 1536px)": {
              px: "256px",
            },
            overflow: "visible",
          }}
        >
          <Slideshow speed={0} animation="sharpen" images={images} />
        </Box>

        {/* Content */}
        <Box css={{ zIndex: 10 }}>
          <Box
            css={{
              display: "flex",
              flexDirection: { base: "column", xl: "row" },
              gap: "2",
              "@media (min-width: 1536px)": {
                px: "192px",
              },
            }}
          >
            <WorkCardTitle title={title} />
            <WorkCardContent
              description={description}
              date={date}
              slug={slug}
              baseUrl={baseUrl}
            />
          </Box>
        </Box>
      </Box>
    );
  },
);

WorkCard.displayName = "WorkCard";
