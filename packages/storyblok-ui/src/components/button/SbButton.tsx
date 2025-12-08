"use client";

import { Button, type ButtonProps, Link } from "@httpjpg/ui";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokLinkObject } from "../link/SbLink";

export interface SbButtonProps {
  blok: {
    _uid: string;
    text: string;
    variant?: "primary" | "secondary" | "outline" | "disabled";
    size?: "sm" | "md" | "lg";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    link?: StoryblokLinkObject;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
  };
  onClick?: () => void;
}

/**
 * Storyblok Button Component
 * Renders a button with configurable styling via Storyblok CMS
 */
export const SbButton = memo(function SbButton({
  blok,
  onClick,
}: SbButtonProps) {
  const {
    text,
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    link,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  const buttonElement = (
    <Button
      variant={variant as ButtonProps["variant"]}
      size={size as ButtonProps["size"]}
      type={type as ButtonProps["type"]}
      disabled={disabled}
      onClick={onClick}
      css={{
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
        ml: mapSpacingToToken(marginLeft),
        mr: mapSpacingToToken(marginRight),
      }}
    >
      {text}
    </Button>
  );

  // If link is provided, wrap button in Link component
  if (link && (link.url || link.cached_url || link.email)) {
    const href = getStoryblokHref(link);
    return (
      <div {...editableProps}>
        <Link href={href}>{buttonElement}</Link>
      </div>
    );
  }

  return <div {...editableProps}>{buttonElement}</div>;
});

/**
 * Convert Storyblok link object to href string
 */
function getStoryblokHref(link: StoryblokLinkObject): string {
  if (!link) {
    return "";
  }

  const { linktype, url, cached_url, email, anchor } = link;

  switch (linktype) {
    case "email":
      return email ? `mailto:${email}` : "";
    case "asset":
    case "url":
      return url || "";
    default: {
      const path = cached_url || url || "";
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return anchor ? `${cleanPath}#${anchor}` : cleanPath;
    }
  }
}
