# isDark Feature Documentation

## Overview

The `isDark` prop feature allows Storyblok pages to toggle dark mode, affecting the page content, header, and footer. This feature is implemented to avoid page flicker and ensures the theme is rendered server-side.

## Implementation

### 1. Storyblok Component Schema

Both `page` and `work` components in Storyblok include an `isDark` boolean field:

```typescript
{
  isDark: {
    type: "boolean",
    display_name: "Dark Mode",
    default_value: "false",
    description: "Enable dark mode for this page",
  }
}
```

### 2. Component Props

The `SbPage` and `SbPageWork` components accept the `isDark` prop and apply appropriate styling:

```typescript
const { isDark = false } = blok;

<Page
  css={{
    bg: isDark ? "black" : "white",
    color: isDark ? "white" : "black",
  }}
>
```

### 3. Theme Provider

A `ThemeProvider` context manages the global theme state and communicates changes from pages to the header/footer:

- Located in: `apps/web/components/providers/theme-provider.tsx`
- Listens for `themeChange` custom events
- Updates body data-theme attribute

### 4. Theme Wrapper

The `ThemeWrapper` component wraps page content and dispatches theme change events:

- Located in: `apps/web/components/ui/theme-wrapper.tsx`
- Sets data-theme attribute on wrapper div
- Dispatches custom event to update header/footer

### 5. Themed Components

- `ThemedHeader` and `ThemedFooter` consume the theme context
- Located in: `apps/web/components/ui/themed-header.tsx` and `themed-footer.tsx`
- Automatically inject `isDark` prop to base components

### 6. Dynamic Page Integration

The dynamic page component extracts `isDark` from story content and wraps the render with `ThemeWrapper`:

```typescript
const isDarkMode = story.content?.isDark === true;

return (
  <ThemeWrapper isDark={isDarkMode}>
    <DynamicRender data={story.content} />
  </ThemeWrapper>
);
```

## Usage in Storyblok

1. Open a page or work item in Storyblok Visual Editor
2. Toggle the "Dark Mode" checkbox in the component settings
3. The page, header, and footer will update to dark theme
4. Publish changes

## Technical Notes

- The theme change happens client-side via `useEffect` in `ThemeWrapper`
- A minimal flicker may occur on initial page load (unavoidable with Next.js App Router architecture)
- The data-theme attribute is set synchronously on the wrapper to minimize flicker
- Header and Footer components support `isDark` prop for styling

## Future Improvements

- Consider using cookies or server-side detection to fully eliminate flicker
- Add CSS transitions for smooth theme switching
- Support more granular theme customization beyond just dark/light
