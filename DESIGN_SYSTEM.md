# @httpjpg Design System

Ein modulares, typsicheres Design System für brutalistisches Web-Design.

## 📦 Packages

### Core Packages

- **`@httpjpg/tokens`** - Zentrale Design Tokens (Farben, Spacing, Typography)
- **`@httpjpg/ui`** - Basis UI-Komponenten mit Panda CSS
- **`@httpjpg/storyblok-ui`** - Storyblok CMS Komponenten

### Utility Packages

- **`@httpjpg/storyblok-api`** - Storyblok API Client
- **`@httpjpg/storyblok-richtext`** - Rich Text Renderer
- **`@httpjpg/storyblok-utils`** - Utility Funktionen

## 🎨 Design Principles

### 1. **Token-basiert**
Alle Werte stammen aus zentralen Design Tokens:

```tsx
import { tokens, getSpacing, getColor } from '@httpjpg/tokens';

// Direkte Token-Nutzung
const spacing = tokens.spacing[4]; // "1rem"
const color = tokens.colors.neutral[500]; // "#737373"

// Helper-Funktionen
const spacing = getSpacing(4); // "1rem"
const color = getColor('neutral.500'); // "#737373"
```

### 2. **Panda CSS First**
Komponenten nutzen Panda CSS für Type-Safe Styling:

```tsx
import { Box } from '@httpjpg/ui';

<Box css={{ p: 4, bg: 'neutral.100', borderRadius: 'lg' }}>
  Content
</Box>
```

### 3. **Modulare Komponenten**
Kleine, wiederverwendbare Komponenten:

```tsx
// ✅ Good: Modulare Caption-Komponente
import { Caption } from '@httpjpg/storyblok-ui';
<Caption data={richTextData} />

// ❌ Bad: Inline styles
<div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
  <StoryblokRichText data={richTextData} />
</div>
```

### 4. **Performance durch Memoization**
Alle Storyblok-Komponenten nutzen `React.memo`:

```tsx
export const SbImage = memo(function SbImage({ blok }: SbImageProps) {
  // Component logic
});
```

## 🔧 Komponenten-Architektur

### Base Components (@httpjpg/ui)

Atomare Komponenten für Layout und Interaktion:

- **Layout**: Box, Container, Section, Stack, Grid
- **Typography**: Headline, Paragraph, Link
- **Media**: Image, Video, Slideshow
- **Interactive**: Button, NavLink, CustomCursor

### Storyblok Components (@httpjpg/storyblok-ui)

Wrapper für Storyblok CMS Integration:

- **Shared**: MediaWrapper, Caption
- **Content**: SbImage, SbVideo, SbText, SbSlideshow
- **Layout**: SbSection, SbContainer, SbGrid
- **Pages**: SbPage, SbPageWork, SbWorkList

## 📝 Best Practices

### Spacing

```tsx
// ✅ Use MediaWrapper für konsistentes Spacing
<MediaWrapper spacingTop="medium" spacingBottom="large">
  <Image src={...} />
</MediaWrapper>

// ❌ Vermeide inline styles
<div style={{ marginTop: '2rem', marginBottom: '4rem' }}>
  <Image src={...} />
</div>
```

### Tokens

```tsx
// ✅ Nutze Panda CSS Tokens
<Box css={{ mt: 8, mb: 16, color: 'neutral.600' }}>

// ✅ Nutze Helper-Funktionen
import { responsiveSpacing } from '@httpjpg/tokens';
css={{ mt: responsiveSpacing(4, 16) }}

// ❌ Vermeide Magic Numbers
<Box css={{ mt: '32px', mb: '64px', color: '#525252' }}>
```

### Wiederverwendbare Komponenten

```tsx
// ✅ Erstelle wiederverwendbare Komponenten
export const Caption = memo(function Caption({ data }: CaptionProps) {
  return (
    <Box css={{ mt: 2, fontSize: 'sm', color: 'neutral.600' }}>
      <StoryblokRichText data={data} />
    </Box>
  );
});

// ✅ Nutze sie konsistent
<Caption data={caption} />
```

## 🚀 Utilities

### Spacing Utils

```tsx
import { getLayoutStyles, getSpacingStyles } from '@httpjpg/storyblok-ui';

// Kombinierte Layout-Styles
const styles = getLayoutStyles('medium', 'large', 'container');

// Nur Spacing
const spacing = getSpacingStyles('16px', '32px');
```

### Token Utils

```tsx
import { pxToRem, responsiveSpacing, clamp } from '@httpjpg/tokens';

// Konvertierung
pxToRem(16); // "1rem"
remToPx(2); // 32

// Responsive Values
responsiveSpacing(4, 16); // "clamp(1rem, 2vw, 4rem)"
clamp('1rem', '2vw', '4rem');
```

## 📚 Storybook

Alle Komponenten sind in Storybook dokumentiert:

```bash
pnpm storybook
```

### Mock Data

Zentrale Mock-Daten in `apps/storybook/stories/storybook-fixtures.ts`:

```tsx
import { OPTIMIZED_IMAGES, MOCK_WORK_ITEMS } from './storybook-fixtures';

// ✅ Nutze zentrale Fixtures
<Image src={OPTIMIZED_IMAGES.videoStill1} />

// ❌ Vermeide hardcoded URLs
<Image src="https://a.storyblok.com/f/281211/..." />
```

## 🔍 Type Safety

Vollständige TypeScript-Unterstützung:

```tsx
import type { StoryblokImage, StoryblokLink } from '@httpjpg/storyblok-ui';

// Alle Types sind exportiert und wiederverwendbar
interface MyComponentProps {
  image: StoryblokImage;
  link: StoryblokLink;
}
```

## 📦 Export Structure

Alle Packages exportieren ihre öffentliche API im Index:

```tsx
// @httpjpg/tokens
export { tokens, spacing, colors, typography };
export { getSpacing, getColor, pxToRem, responsiveSpacing };

// @httpjpg/ui
export { Box, Container, Section, Image, Video };

// @httpjpg/storyblok-ui
export { SbImage, SbVideo, Caption, MediaWrapper };
export { getLayoutStyles, getSpacingStyles };
export type { StoryblokImage, StoryblokLink, StoryblokBlok };
```

## 🎯 Migration Guide

Von inline styles zu modularen Komponenten:

```tsx
// Before ❌
<div style={{ marginTop: spacingTop, marginBottom: spacingBottom }}>
  <Image src={...} />
  {caption && (
    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
      <StoryblokRichText data={caption} />
    </div>
  )}
</div>

// After ✅
<MediaWrapper spacingTop={spacingTop} spacingBottom={spacingBottom}>
  <Image src={...} />
  {caption && <Caption data={caption} />}
</MediaWrapper>
```
