import { DynamicRender } from "@httpjpg/storyblok-utils";
import { Page } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import type { ComponentProps } from "react";

/**
 * Storyblok Page Component Props
 */
export interface SbPageProps extends ComponentProps<typeof Page> {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    title?: string;
    isDark?: boolean;
  };
}

/**
 * Basic Page wrapper for Storyblok content
 * Dark mode controlled by Storyblok isDark field only
 * @param blok - Storyblok content block with optional body items to render
 */
export function SbPage({ blok }: SbPageProps) {
  const { body, isDark = false } = blok;

  return (
    <Page
      {...storyblokEditable(blok)}
      css={{
        bg: isDark ? "black" : "white",
        color: isDark ? "white" : "black",
      }}
    >
      {body && <DynamicRender data={body as any} />}
    </Page>
  );
}
