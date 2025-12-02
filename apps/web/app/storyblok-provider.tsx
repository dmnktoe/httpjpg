"use client";

/**
 * Initialize Storyblok with API plugin and component mapping
 *
 * Register your Storyblok components here for dynamic rendering
 */
import {
  SbConfig,
  SbContainer,
  SbGrid,
  SbHeadline,
  SbImage,
  SbMissing,
  SbPage,
  SbPageWork,
  SbParagraph,
  SbRichText,
  SbSection,
  SbSlideshow,
  SbVideo,
  SbWorkCard,
  SbWorkList,
} from "@httpjpg/storyblok-ui";
import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import { type ReactNode, useEffect } from "react";

/**
 * Storyblok component registry
 * Register all Storyblok components for dynamic rendering
 *
 * Missing components will fallback to SbMissing (shows warning in dev)
 */
const components = {
  // Page types
  page: SbPage,
  work: SbPageWork,

  // Layout components
  container: SbContainer,
  grid: SbGrid,
  section: SbSection,

  // Content components
  headline: SbHeadline,
  image: SbImage,
  paragraph: SbParagraph,
  richtext: SbRichText,
  text: SbParagraph, // Legacy: map "text" to "paragraph"
  slideshow: SbSlideshow,
  video: SbVideo,

  // Work/Portfolio components
  work_card: SbWorkCard,
  work_list: SbWorkList,

  // Configuration
  config: SbConfig,
};

/**
 * Initialize Storyblok once
 */
let isInitialized = false;

function initializeStoryblok() {
  if (isInitialized) {
    return;
  }

  console.log(
    "[Storyblok] Initializing SDK with components:",
    Object.keys(components),
  );

  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    // Type assertion needed due to React 18/19 type compatibility
    components: {
      ...components,
      // Fallback for missing components (shows warning in dev)
      ...(process.env.NODE_ENV === "development" && {
        _fallback: SbMissing,
      }),
    } as any,
    apiOptions: {
      region: "eu",
    },
    bridge: true, // Enable bridge for Visual Editor
  });

  isInitialized = true;
  console.log("[Storyblok] SDK initialized successfully");
}

// Initialize immediately on module load
initializeStoryblok();

/**
 * Storyblok Bridge Loader for Visual Editor
 * Loads the Storyblok Bridge script dynamically in preview mode
 */
function StoryblokBridgeLoader() {
  useEffect(() => {
    // Check if we're in Visual Editor (has _storyblok params or draft mode cookie)
    const isDraftMode =
      document.cookie.includes("__prerender_bypass") ||
      window.location.search.includes("_storyblok") ||
      window.location.search.includes("_draft");

    if (!isDraftMode) {
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://app.storyblok.com/f/storyblok-v2-latest.js"]',
    );

    if (existingScript) {
      console.log("[Storyblok Bridge] Script already loaded");
      return;
    }

    // Load Storyblok Bridge script
    const script = document.createElement("script");
    script.src = "https://app.storyblok.com/f/storyblok-v2-latest.js";
    script.async = true;

    script.onload = () => {
      console.log("[Storyblok Bridge] Bridge script loaded successfully");
    };

    script.onerror = () => {
      console.error("[Storyblok Bridge] Failed to load bridge script");
    };

    document.body.appendChild(script);
    console.log("[Storyblok Bridge] Loading bridge script for Visual Editor");

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
  // Initialize Storyblok on mount
  useEffect(() => {
    initializeStoryblok();
  }, []);

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
