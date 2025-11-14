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
    const formattedDate = date
      ? new Date(date).toLocaleDateString("de-DE", {
          year: "2-digit",
          month: "narrow",
          day: "2-digit",
        })
      : null;

    return (
      <Box
        ref={ref}
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
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
          <Slideshow animation="sharpen" images={images} />
        </Box>

        {/* Content */}
        <Box css={{ zIndex: 10 }}>
          <Box
            css={{
              display: "flex",
              flexDirection: { base: "column", xl: "row" },
              gap: "8px",
              "@media (min-width: 1536px)": {
                px: "192px",
              },
            }}
          >
            {/* Title */}
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
                  lineHeight: "0.8",
                  letterSpacing: "-0.05em",
                }}
              >
                <AnimateInView animation="fadeIn" delay={0.5}>
                  <Box
                    as="span"
                    css={{
                      display: "inline-block",
                    }}
                  >
                    <Icon
                      name="arrow-up"
                      size="7.5vw"
                      css={{
                        position: "relative",
                        top: "0.8vw",
                        transform: "rotate(90deg)",
                        "@media (min-width: 1280px)": {
                          width: "5.5vw",
                        },
                      }}
                    />
                  </Box>
                  {title}
                </AnimateInView>
              </Box>
            </Box>

            {/* Description & Meta */}
            <Box css={{ w: { base: "full", xl: "1/2" } }}>
              <Box
                css={{
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  w: { base: "full", md: "10/12", xl: "full" },
                }}
              >
                {/* Description */}
                {description && (
                  <Paragraph
                    size="sm"
                    css={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: { base: 5, xl: "none" },
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {description}
                  </Paragraph>
                )}

                {/* Date & Link */}
                <Box>
                  {formattedDate && (
                    <Box
                      css={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "mono",
                        fontSize: "0.75rem",
                        mb: "4px",
                      }}
                    >
                      <Box
                        css={{
                          opacity: 0.5,
                        }}
                      >
                        ╱╱
                      </Box>
                      <Box
                        css={{
                          letterSpacing: "0.05em",
                        }}
                      >
                        {formattedDate}
                      </Box>
                      <Box
                        css={{
                          opacity: 0.3,
                          fontSize: "0.65rem",
                        }}
                      >
                        ⌘ρτ
                      </Box>
                    </Box>
                  )}
                  <Box>
                    <Link
                      href={`${baseUrl}/${slug}`}
                      css={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        color: "blue",
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
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
);

WorkCard.displayName = "WorkCard";
