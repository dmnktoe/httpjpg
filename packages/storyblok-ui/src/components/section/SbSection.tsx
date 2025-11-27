import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Section } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapColorToToken } from "../../lib/token-mapping";

export interface SbSectionProps {
  blok: {
    _uid: string;
    content?: SbBlokData[];
    bgColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    marginTop?: string;
    marginBottom?: string;
    width?: "container" | "full";
    // Responsive overrides (optional)
    paddingTopMd?: string;
    paddingBottomMd?: string;
    paddingLeftMd?: string;
    paddingRightMd?: string;
    paddingTopLg?: string;
    paddingBottomLg?: string;
    paddingLeftLg?: string;
    paddingRightLg?: string;
  };
}

/**
 * Storyblok Section Component
 * Semantic section wrapper with spacing and background options
 */
export const SbSection = memo(function SbSection({ blok }: SbSectionProps) {
  const {
    content,
    bgColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    marginTop,
    marginBottom,
    width = "container",
    paddingTopMd,
    paddingBottomMd,
    paddingLeftMd,
    paddingRightMd,
    paddingTopLg,
    paddingBottomLg,
    paddingLeftLg,
    paddingRightLg,
  } = blok;

  if (!content || content.length === 0) {
    return null;
  }

  // Build responsive spacing objects
  const ptValue = mapSpacingToToken(paddingTop);
  const pbValue = mapSpacingToToken(paddingBottom);
  const plValue = mapSpacingToToken(paddingLeft);
  const prValue = mapSpacingToToken(paddingRight);

  const responsivePt =
    paddingTopMd || paddingTopLg
      ? {
          base: ptValue,
          md: mapSpacingToToken(paddingTopMd) || ptValue,
          lg:
            mapSpacingToToken(paddingTopLg) ||
            mapSpacingToToken(paddingTopMd) ||
            ptValue,
        }
      : ptValue;

  const responsivePb =
    paddingBottomMd || paddingBottomLg
      ? {
          base: pbValue,
          md: mapSpacingToToken(paddingBottomMd) || pbValue,
          lg:
            mapSpacingToToken(paddingBottomLg) ||
            mapSpacingToToken(paddingBottomMd) ||
            pbValue,
        }
      : pbValue;

  const responsivePl =
    paddingLeftMd || paddingLeftLg
      ? {
          base: plValue,
          md: mapSpacingToToken(paddingLeftMd) || plValue,
          lg:
            mapSpacingToToken(paddingLeftLg) ||
            mapSpacingToToken(paddingLeftMd) ||
            plValue,
        }
      : plValue;

  const responsivePr =
    paddingRightMd || paddingRightLg
      ? {
          base: prValue,
          md: mapSpacingToToken(paddingRightMd) || prValue,
          lg:
            mapSpacingToToken(paddingRightLg) ||
            mapSpacingToToken(paddingRightMd) ||
            prValue,
        }
      : prValue;

  return (
    <Section
      {...storyblokEditable(blok)}
      useContainer={width === "container"}
      pt={responsivePt}
      pb={responsivePb}
      pl={responsivePl}
      pr={responsivePr}
      css={{
        bg: mapColorToToken(bgColor),
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
      }}
    >
      <DynamicRender data={content as BlokItem[]} />
    </Section>
  );
});
