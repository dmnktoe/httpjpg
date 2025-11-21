import { DynamicRender } from "@httpjpg/storyblok-utils";
import { Page } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";

/**
 * Work Page Component Props
 */
export interface SbPageWorkProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    isDark?: boolean;
  };
}

/**
 * Flexible Work/Portfolio Page for Storyblok
 * Completely customizable through Visual Editor with nested components
 *
 * Usage in Storyblok:
 * - Add any components you want (sections, grids, images, text, etc.)
 * - Arrange them freely in the Visual Editor
 * - No fixed structure - full creative freedom
 */
export function SbPageWork({ blok }: SbPageWorkProps) {
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
