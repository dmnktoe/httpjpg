"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { WorkCard, type WorkCardProps } from "../work-card/work-card";

export interface WorkListProps {
  /**
   * Array of work items to display
   */
  works: WorkCardProps[];
  /**
   * Gap between work cards
   * @default "96px"
   */
  gap?: string | number;
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
 * Displays a vertical list of WorkCard components with consistent spacing.
 * Perfect for portfolio pages showing multiple projects.
 *
 * @example
 * ```tsx
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
 *   gap="128px"
 * />
 * ```
 */
export const WorkList = forwardRef<HTMLDivElement, WorkListProps>(
  ({ works, gap = "96px", header, footer, css: cssProp, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        css={{
          display: "flex",
          flexDirection: "column",
          ...cssProp,
        }}
        {...props}
      >
        {header && <Box css={{ mb: gap }}>{header}</Box>}

        <Box
          css={{
            display: "flex",
            flexDirection: "column",
            gap,
          }}
        >
          {works.map((work, index) => (
            <WorkCard key={work.slug || index} {...work} />
          ))}
        </Box>

        {footer && <Box css={{ mt: gap }}>{footer}</Box>}
      </Box>
    );
  },
);

WorkList.displayName = "WorkList";
