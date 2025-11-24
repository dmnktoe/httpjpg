"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import type { FooterProps } from "../footer/footer";
import { Footer } from "../footer/footer";
import type { HeaderProps } from "../header/header";
import { Header } from "../header/header";

export interface PageProps {
  /**
   * Header configuration (nav, work items, etc.)
   */
  header?: HeaderProps;
  /**
   * Footer configuration (background, links, etc.)
   */
  footer?: FooterProps;
  /**
   * Main page content
   */
  children: ReactNode;
  /**
   * Additional Panda CSS styles for the main content wrapper
   */
  css?: SystemStyleObject;
  /**
   * Storyblok component data (for future CMS integration)
   * @future Will contain blok data from Storyblok API
   */
  blok?: Record<string, unknown>;
}

/**
 * Page component - Full page layout with Header and Footer
 *
 * Provides a consistent page structure with header navigation,
 * main content area, and footer. Designed to be Storyblok-compatible
 * for future CMS integration.
 *
 * @example
 * ```tsx
 * <Page
 *   header={{
 *     nav: [{ name: "Home", href: "/" }],
 *     personalWork: [{ id: "1", slug: "project", title: "Project" }]
 *   }}
 *   footer={{
 *     backgroundImage: "/images/footer_bg.png"
 *   }}
 * >
 *   <h1>Page Content</h1>
 * </Page>
 * ```
 */
export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ header, footer, children, css: cssProp, blok, ...props }, ref) => {
    const footerHeight = 100; // Approximate footer height

    return (
      <Box
        ref={ref}
        css={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#ffffff",
          ...cssProp,
        }}
        {...props}
      >
        {/* Header */}
        {header && <Header {...header} />}

        {/* Main Content */}
        <Box
          as="main"
          css={{
            flex: 1,
            paddingBottom: footer ? `${footerHeight}px` : "0",
            // Add data attribute for Storyblok visual editor (future)
            ...(blok && { "data-blok-c": JSON.stringify(blok) }),
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        {footer && <Footer {...footer} />}
      </Box>
    );
  },
);

Page.displayName = "Page";
