"use client";

import type { StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, Button, type ButtonProps } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbButtonProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    type?: ButtonProps["type"];
    disabled?: boolean;
    link?: StoryblokLink;
  };
  onClick?: () => void;
}

export const SbButton = memo(function SbButton({ blok, onClick }: SbButtonProps) {
  const { text, variant = "primary", size = "md", type = "button", disabled, link } = blok;
  const href = storyblokHref(link);
  const editable = editableAttrs(blok);
  const spacing = spacingCss(blok);

  if (href) {
    return (
      <Box {...editable}>
        <Button variant={variant} size={size} href={href} css={spacing}>
          {text}
        </Button>
      </Box>
    );
  }

  return (
    <Box {...editable}>
      <Button
        variant={variant}
        size={size}
        type={type}
        disabled={disabled}
        onClick={onClick}
        css={spacing}
      >
        {text}
      </Button>
    </Box>
  );
});
