"use client";

import { DynamicRender } from "@httpjpg/storyblok-utils";
import type { ISbStoryData } from "@storyblok/react";
import { useEffect, useState } from "react";

interface StoryblokLivePreviewProps {
  story: ISbStoryData;
}

/**
 * Client Component for Storyblok Live Preview
 * Manual Bridge integration for reliable live updates
 */
export function StoryblokLivePreview({
  story: initialStory,
}: StoryblokLivePreviewProps) {
  const [story, setStory] = useState(initialStory);

  useEffect(() => {
    let bridgeInitialized = false;
    let checkInterval: NodeJS.Timeout | undefined;

    const initBridge = () => {
      if (bridgeInitialized) {
        return;
      }

      const sbBridge = (window as any).storyblok;
      if (!sbBridge) {
        return;
      }

      bridgeInitialized = true;

      // Listen for input events (real-time editing)
      sbBridge.on("input", (event: any) => {
        if (event.story?.id === story.id) {
          setStory(event.story);
        }
      });

      // Listen for change events
      sbBridge.on("change", (event: any) => {
        if (event.story?.id === story.id) {
          setStory(event.story);
        }
      });

      // Listen for published events
      sbBridge.on("published", () => {
        window.location.reload();
      });

      // Ping the Visual Editor
      sbBridge.pingEditor(() => {
        console.log("[Storyblok] Visual Editor connected");
      });
    };

    // Check if bridge is available
    const checkBridgeAvailable = () => {
      return (window as any).StoryblokBridge || (window as any).storyblok;
    };

    if (checkBridgeAvailable()) {
      // Create instance if needed
      if ((window as any).StoryblokBridge && !(window as any).storyblok) {
        (window as any).storyblok = new (window as any).StoryblokBridge();
      }
      initBridge();
    } else {
      // Wait for bridge script to load
      checkInterval = setInterval(() => {
        const bridge = checkBridgeAvailable();
        if (bridge) {
          if ((window as any).StoryblokBridge && !(window as any).storyblok) {
            (window as any).storyblok = new (window as any).StoryblokBridge();
          }

          initBridge();

          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = undefined;
          }
        }
      }, 200);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = undefined;
        }
        if (!bridgeInitialized) {
          console.error("[Storyblok] Bridge failed to load");
        }
      }, 10000);

      return () => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        clearTimeout(timeout);
      };
    }
  }, [story.id]);

  if (!story?.content) {
    return null;
  }

  return <DynamicRender data={story.content as any} />;
}
