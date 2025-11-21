"use client";

/**
 * Initialize Storyblok with API plugin and component mapping
 *
 * Register your Storyblok components here for dynamic rendering
 */
import {
  SbContainer,
  SbGrid,
  SbImage,
  SbPage,
  SbPageWork,
  SbSection,
  SbSlideshow,
  SbText,
  SbWorkList,
} from "@httpjpg/storyblok-ui";
import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import { type ReactNode, useEffect } from "react";

/**
 * Initialize Storyblok with API plugin and component mapping
 *
 * Register all Storyblok components for dynamic rendering
 */
storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    // Page types
    page: SbPage,
    work: SbPageWork,

    // Layout components
    container: SbContainer,
    grid: SbGrid,
    section: SbSection,

    // Content components
    image: SbImage,
    text: SbText,
    slideshow: SbSlideshow,

    // Work/Portfolio components
    "work-list": SbWorkList,
  },
  apiOptions: {
    region: "eu",
  },
});

/**
 * Storyblok Bridge Loader for Visual Editor
 * Loads the Storyblok Bridge script dynamically in preview mode
 */
function StoryblokBridgeLoader() {
  useEffect(() => {
    // Only load bridge in draft mode
    const isDraftMode = document.cookie.includes("__prerender_bypass");

    if (!isDraftMode) {
      return;
    }

    // Load Storyblok Bridge script
    const script = document.createElement("script");
    script.src = "https://app.storyblok.com/f/storyblok-v2-latest.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
}

/**
 * Storyblok Provider Component
 * Wraps the app to enable Storyblok bridge for Visual Editor
 */
export function StoryblokProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StoryblokBridgeLoader />
    </>
  );
}

// Optional: Export PreviewNotification for use in layout
// import { PreviewNotification } from "./components/preview-notification";
// Add <PreviewNotification /> to layout if you want preview badge
