"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Divider, type DividerProps } from "../divider/divider";
import { VStack } from "../stack/stack";
import { WorkCard, type WorkCardProps } from "../work-card/work-card";

export interface WorkListProps {
  /**
   * Array of work items to display
   */
  works: WorkCardProps[];
  /**
   * Gap between work cards
   * @default 24
   */
  gap?: string | number;
  /**
   * Show dividers between work items
   * @default false
   */
  showDividers?: boolean;
  /**
   * Divider configuration (when showDividers is true)
   */
  dividerProps?: Omit<DividerProps, "orientation">;
  /**
   * Additional content before work list
   */
  header?: ReactNode;
  /**
   * Additional content after work list
   */
  footer?: ReactNode;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * WorkList component - Portfolio work showcase list
 *
 * Displays a vertical stack of WorkCard components with consistent spacing
 * and optional dividers. Built on VStack for semantic layout composition.
 * Perfect for portfolio pages showing multiple projects.
 *
 * **Features:**
 * - 📚 Semantic vertical stack layout with VStack
 * - ➗ Optional dividers between items
 * - 🎨 Customizable gap and divider styling
 * - 🔝 Header/footer support for additional content
 *
 * @example
 * ```tsx
 * // Basic work list
 * <WorkList
 *   works={[
 *     {
 *       title: "Project 1",
 *       slug: "project-1",
 *       images: [{ url: "/p1.jpg", alt: "Project 1" }],
 *       date: "2024-03-15"
 *     },
 *     {
 *       title: "Project 2",
 *       slug: "project-2",
 *       images: [{ url: "/p2.jpg", alt: "Project 2" }]
 *     }
 *   ]}
 *   gap={24}
 * />
 *
 * // With dividers and custom styling
 * <WorkList
 *   works={projects}
 *   gap={16}
 *   showDividers
 *   dividerProps={{
 *     variant: "dashed",
 *     color: "neutral.400",
 *     spacing: 12
 *   }}
 * />
 *
 * // With header and footer
 * <WorkList
 *   works={projects}
 *   header={<Headline>Featured Work</Headline>}
 *   footer={<Link href="/work">View All →</Link>}
 *   gap={20}
 * />
 *
 * // ASCII dividers for brutalist aesthetic
 * <WorkList
 *   works={projects}
 *   showDividers
 *   dividerProps={{
 *     variant: "ascii",
 *     pattern: "* * * * *",
 *     spacing: 8
 *   }}
 * />
 * ```
 */
export const WorkList = forwardRef<HTMLDivElement, WorkListProps>(
  (
    {
      works,
      gap = 24,
      showDividers = false,
      dividerProps,
      header,
      footer,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <VStack ref={ref} gap={gap} align="stretch" css={cssProp} {...props}>
        {header}

        {works.map((work, index) => (
          <>
            <WorkCard key={work.slug || index} {...work} />
            {showDividers && index < works.length - 1 && (
              <Divider orientation="horizontal" {...dividerProps} />
            )}
          </>
        ))}

        {footer}
      </VStack>
    );
  },
);

WorkList.displayName = "WorkList";
