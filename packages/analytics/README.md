# @httpjpg/analytics

Google Analytics integration with custom event tracking helpers.

## Installation

This package is part of the httpjpg monorepo and uses workspace dependencies.

```bash
pnpm add @httpjpg/analytics
```

## Setup

### 1. Environment Variables

Add your Google Analytics Measurement ID to `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-H4TMWSN63E
```

### 2. Add Google Analytics Script

In your Next.js layout:

```tsx
import { env } from "@httpjpg/env";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
```

### 3. Track Web Vitals (Optional)

Add the Web Vitals reporter component:

```tsx
import { WebVitalsReporter } from "@/components/web-vitals-reporter";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

## Usage

### Basic Event Tracking

```tsx
import { trackEvent, GA_CATEGORIES } from "@httpjpg/analytics";

// Track a custom event
trackEvent("button_click", {
  category: GA_CATEGORIES.USER_INTERACTION,
  label: "hero_cta",
  value: 1,
});
```

### Predefined Event Helpers

#### Navigation Tracking

```tsx
import { trackNavigation } from "@httpjpg/analytics";

trackNavigation("/about", "About Page");
```

#### Work/Portfolio Tracking

```tsx
import { trackWorkView, trackWorkInteraction } from "@httpjpg/analytics";

// Track work item view
trackWorkView("work-123", "Project Title");

// Track work item interaction
trackWorkInteraction("work-123", "image_click");
```

#### Media Tracking

```tsx
import { trackMediaPlay } from "@httpjpg/analytics";

trackMediaPlay("video", "https://example.com/video.mp4");
```

#### Contact Form Tracking

```tsx
import { trackContactInteraction } from "@httpjpg/analytics";

trackContactInteraction("open");
trackContactInteraction("submit");
trackContactInteraction("close");
```

#### Error Tracking

```tsx
import { trackError } from "@httpjpg/analytics";

trackError("api_error", "Failed to fetch data", false);
```

#### UI Component Tracking

```tsx
import {
  trackCursorInteraction,
  trackNowPlayingClick,
  trackHeaderInteraction,
  trackFooterClick,
} from "@httpjpg/analytics";

// Track custom cursor interactions
trackCursorInteraction("hover_work_item");

// Track Spotify widget clicks
trackNowPlayingClick();

// Track header interactions
trackHeaderInteraction("menu_open");

// Track footer clicks
trackFooterClick("social_link", "twitter");
```

#### Performance Tracking

```tsx
import { trackPerformance, trackWebVital } from "@httpjpg/analytics";

// Track custom performance metrics
trackPerformance("api_response_time", 250);

// Track Web Vitals
trackWebVital("LCP", 2500);
```

## Event Categories

Predefined event categories for consistent tracking:

```tsx
export const GA_CATEGORIES = {
  USER_INTERACTION: "user_interaction",
  NAVIGATION: "navigation",
  MEDIA: "media",
  WORK: "work",
  CONTACT: "contact",
  ERROR: "error",
  PERFORMANCE: "performance",
};
```

## Development Mode

In development mode, events are logged to the console instead of being sent to Google Analytics. Set `NODE_ENV=production` to send real events.

## TypeScript Support

Full TypeScript support with type definitions for all tracking functions and event parameters.

## Best Practices

1. **Use predefined helpers** when available for consistency
2. **Keep event names short** and descriptive
3. **Use categories** to organize related events
4. **Add labels** for additional context
5. **Track values** for quantifiable metrics
6. **Test in development** before deploying

## Example: Tracking a Button Click

```tsx
"use client";

import { trackEvent, GA_CATEGORIES } from "@httpjpg/analytics";

export function CTAButton() {
  const handleClick = () => {
    trackEvent("cta_click", {
      category: GA_CATEGORIES.USER_INTERACTION,
      label: "hero_section",
      value: 1,
    });
  };

  return <button onClick={handleClick}>Get Started</button>;
}
```

## License

Private package for httpjpg project.
