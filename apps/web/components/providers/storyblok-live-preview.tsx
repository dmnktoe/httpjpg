"use client";

import { DynamicRender } from "@httpjpg/storyblok-utils";
import * as Sentry from "@sentry/nextjs";
import type { ISbStoryData } from "@storyblok/react";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from "react";

interface StoryblokLivePreviewProps {
  story: ISbStoryData;
}

/**
 * Error Boundary for Storyblok Components
 */
class StoryblokErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  public state = { hasError: false, error: undefined as Error | undefined };

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
      tags: { errorBoundary: "storyblok" },
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#ef4444",
          }}
        >
          <h2>Fehler beim Laden des Storyblok-Inhalts</h2>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
            {this.state.error?.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Storyblok Live Preview Component
 * Uses window.StoryblokBridge API for reliable Visual Editor integration
 */
function StoryblokLivePreviewInner({
  story: initialStory,
}: StoryblokLivePreviewProps) {
  const [story, setStory] = useState(initialStory);

  useEffect(() => {
    // Wait for Storyblok Bridge to be available
    const initBridge = () => {
      const sbBridge = (window as any).storyblok;
      if (!sbBridge) {
        return false;
      }

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

      // Ping editor
      sbBridge.pingEditor(() => {
        // Visual Editor connected
      });

      return true;
    };

    // Try to initialize immediately
    if ((window as any).storyblok || (window as any).StoryblokBridge) {
      if ((window as any).StoryblokBridge && !(window as any).storyblok) {
        (window as any).storyblok = new (window as any).StoryblokBridge();
      }
      initBridge();
      return;
    }

    // Otherwise wait for bridge to load
    const checkInterval = setInterval(() => {
      if ((window as any).StoryblokBridge || (window as any).storyblok) {
        if ((window as any).StoryblokBridge && !(window as any).storyblok) {
          (window as any).storyblok = new (window as any).StoryblokBridge();
        }
        if (initBridge()) {
          clearInterval(checkInterval);
        }
      }
    }, 200);

    return () => clearInterval(checkInterval);
  }, [story.id]);

  if (!story?.content) {
    return null;
  }

  return <DynamicRender data={story.content as any} />;
}

/**
 * Main export with error boundary
 */
export function StoryblokLivePreview(props: StoryblokLivePreviewProps) {
  return (
    <StoryblokErrorBoundary>
      <StoryblokLivePreviewInner {...props} />
    </StoryblokErrorBoundary>
  );
}
