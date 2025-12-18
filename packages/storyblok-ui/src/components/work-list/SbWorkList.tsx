"use client";

import { renderStoryblokRichText } from "@httpjpg/storyblok-richtext";
import { WorkList } from "@httpjpg/ui";
import { memo, type ReactNode, useRef } from "react";
import { mapColorToToken } from "../../lib/token-mapping";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbWorkListProps {
  blok: {
    _uid: string;
    work?: Array<
      | string
      | {
          name: string;
          slug: string;
          full_slug: string;
          created_at: string;
          published_at?: string;
          first_published_at?: string;
          content?: {
            title?: string;
            description?: any;
            images?: Array<{
              filename: string;
              alt?: string;
              title?: string;
              copyright?: string;
              focus?: string;
              content_type?: string;
              is_external_url?: boolean;
            }>;
            date?: string;
            date_end?: string;
          };
        }
    >; // Array of story UUIDs or resolved stories
    gap?: number;
    showDividers?: boolean;
    dividerPattern?: string;
    dividerColor?: string;
    dividerSpacing?: string;
  };
  /**
   * Base URL for work links
   * @default "/work"
   */
  baseUrl?: string;
}

/**
 * Storyblok Work List Component
 * Displays a list of portfolio work items
 */
export const SbWorkList = memo(function SbWorkList({
  blok,
  baseUrl = "/work",
}: SbWorkListProps) {
  const editableProps = useStoryblokEditable(blok);
  const lastWorkItemsRef = useRef<any[]>([]);

  const {
    work,
    gap,
    showDividers,
    dividerPattern,
    dividerColor,
    dividerSpacing,
  } = blok || {};
  const showDividersValue = showDividers === true;

  // Filter out UUIDs and only keep resolved stories
  const workStories = (work || []).filter(
    (item): item is Exclude<typeof item, string> =>
      item != null && typeof item === "object" && "slug" in item,
  );

  // Use cached items during Storyblok reload (Visual Editor stability)
  if (!workStories || workStories.length === 0) {
    if (lastWorkItemsRef.current.length > 0 && work && work.length > 0) {
      return (
        <div {...editableProps} key={blok._uid}>
          <WorkList
            works={lastWorkItemsRef.current}
            gap={gap}
            showDividers={showDividersValue}
            dividerProps={
              showDividersValue
                ? {
                    variant: "ascii",
                    pattern: dividerPattern || "⋆｡°✩ ･ ✦ ･ ✧ ･ ✦ ･ ✩°｡⋆",
                    color: mapColorToToken(dividerColor) || "neutral.200",
                    spacing: dividerSpacing || "3",
                  }
                : undefined
            }
          />
        </div>
      );
    }

    return (
      <div {...editableProps} key={blok._uid}>
        <div
          style={{
            padding: "1rem",
            border: "2px dashed #ccc",
            textAlign: "center",
          }}
        >
          No work items selected. Add work items in Storyblok.
        </div>
      </div>
    );
  }

  // Transform Storyblok work data to WorkList format
  const workItems = workStories
    .map((item) => {
      if (!item.slug) return null;

      const dateString =
        item.content?.date_end ||
        item.content?.date ||
        item.first_published_at ||
        item.published_at ||
        item.created_at ||
        new Date().toISOString();

      let description: ReactNode;
      if (item.content?.description) {
        try {
          description = renderStoryblokRichText(item.content.description);
        } catch {
          // Silently fail - description is optional
        }
      }

      return {
        id: item.slug,
        slug: item.slug,
        title: item.content?.title || item.name || "Untitled",
        description,
        images: (item.content?.images || [])
          .filter((img) => img?.filename)
          .map((img) => {
            const hasVideoContentType = img.content_type?.startsWith("video/");
            const hasVideoExtension =
              /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(img.filename || "");
            const isVideo = hasVideoContentType || hasVideoExtension;

            return {
              url: isVideo ? "" : img.filename || "",
              alt: img.alt || item.content?.title || item.name || "Image",
              copyright: img.copyright,
              focus: img.focus,
              videoUrl: isVideo ? img.filename : undefined,
            };
          }),
        date: dateString,
        baseUrl,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (workItems.length === 0) {
    return (
      <div {...editableProps} key={blok._uid}>
        <div
          style={{
            padding: "1rem",
            border: "2px dashed #f00",
            textAlign: "center",
          }}
        >
          ⚠️ Error loading work items.
        </div>
      </div>
    );
  }

  lastWorkItemsRef.current = workItems;

  return (
    <div {...editableProps} key={blok._uid}>
      <WorkList
        works={workItems}
        gap={gap}
        showDividers={showDividersValue}
        dividerProps={
          showDividersValue
            ? {
                variant: "ascii",
                pattern: dividerPattern || "⋆｡°✩ ･ ✦ ･ ✧ ･ ✦ ･ ✩°｡⋆",
                color: mapColorToToken(dividerColor) || "neutral.200",
                spacing: dividerSpacing || "3",
              }
            : undefined
        }
      />
    </div>
  );
});
