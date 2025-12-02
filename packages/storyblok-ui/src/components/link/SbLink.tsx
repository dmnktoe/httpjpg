"use client";

import { Link, type LinkProps } from "@httpjpg/ui";

/**
 * Storyblok link object types
 */
export interface StoryblokLinkObject {
  linktype?: "url" | "story" | "email" | "asset";
  url?: string;
  cached_url?: string;
  email?: string;
  anchor?: string;
}

export interface SbLinkProps extends Omit<LinkProps, "href"> {
  /**
   * Storyblok link object
   */
  link: StoryblokLinkObject;
}

/**
 * Convert Storyblok link object to href string
 */
const getStoryblokHref = (link: StoryblokLinkObject): string => {
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
    case "story":
    default: {
      const path = cached_url || url || "";
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return anchor ? `${cleanPath}#${anchor}` : cleanPath;
    }
  }
};

/**
 * SbLink Component
 * Wrapper around base Link component that consumes Storyblok link objects
 */
export const SbLink = ({ link, children, ...props }: SbLinkProps) => {
  const href = getStoryblokHref(link);

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

SbLink.displayName = "SbLink";
