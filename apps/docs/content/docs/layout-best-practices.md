# Layout & Container Best Practices

## Overview

Diese App verwendet ein **containerless layout pattern** für maximale Flexibilität bei Storyblok Pages und full-width sections.

## Architecture

```
RootLayout (app/layout.tsx)
├── Header (full-width)
├── <main> (NO container)
│   ├── Page content (handles own containers)
│   └── Loading/Error states (use Container/Section)
└── Footer (full-width)
```

## Key Principles

### 1. Root Layout = Shell Only

**`app/layout.tsx`** provides only:
- Header (full-width)
- Footer (full-width)
- Global UI (CustomCursor, NowPlaying, ImagePreview)
- Main wrapper (NO container)

❌ **NEVER** add Container to root layout
✅ **ALWAYS** let pages control their own layout

### 2. Pages Control Their Layout

Every page must use `Container` and `Section` components:

```tsx
// ✅ CORRECT - Page with mixed layouts
export default function Page() {
  return (
    <>
      {/* Full-width hero */}
      <Section pt={0} pb={16} fullWidth useContainer={false}>
        <HeroImage />
      </Section>

      {/* Contained content */}
      <Section pt={16} pb={16} fullWidth containerSize="2xl">
        <Container size="lg" px={{ base: 4, md: 6, lg: 8 }}>
          <Headline>Title</Headline>
          <Paragraph>Content</Paragraph>
        </Container>
      </Section>

      {/* Another full-width section */}
      <Section pt={16} pb={24} fullWidth useContainer={false}>
        <ImageGallery />
      </Section>
    </>
  );
}
```

```tsx
// ❌ WRONG - No container control
export default function Page() {
  return (
    <>
      <Headline>Title</Headline>
      <Paragraph>Content</Paragraph>
    </>
  );
}
```

### 3. Loading States Match Page Structure

Loading and error states must use the same Container/Section structure:

```tsx
// ✅ CORRECT - Wrapped in Container/Section
export default function Loading() {
  return (
    <Section pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 24 }} fullWidth containerSize="2xl">
      <Container size="lg" px={{ base: 4, md: 6, lg: 8 }}>
        <Loading />
      </Container>
    </Section>
  );
}
```

```tsx
// ❌ WRONG - No container
export default function Loading() {
  return <Loading />;
}
```

### 4. Storyblok Pages

Storyblok components should be built with Container/Section awareness:

```tsx
// ✅ CORRECT - Storyblok component with container control
export const StoryblokHero = ({ blok }) => {
  return (
    <Section 
      pt={blok.paddingTop || 0} 
      pb={blok.paddingBottom || 16} 
      fullWidth 
      useContainer={blok.useContainer}
      containerSize={blok.containerSize}
    >
      {blok.useContainer ? (
        <Container size={blok.innerContainerSize || "lg"}>
          <Content />
        </Container>
      ) : (
        <Content />
      )}
    </Section>
  );
};
```

## Component Usage

### Section Component

Controls vertical spacing and optional container wrapper:

```tsx
<Section
  pt={{ base: 8, md: 16, lg: 24 }}  // Responsive padding top
  pb={{ base: 8, md: 16 }}            // Responsive padding bottom
  fullWidth={true}                    // Take full page width
  useContainer={true}                 // Wrap in Container?
  containerSize="2xl"                 // Container max-width
>
  {children}
</Section>
```

**Props:**
- `pt`, `pb`, `pl`, `pr` - Panda spacing tokens (0-96) or responsive objects
- `fullWidth` - Take full width (default: true)
- `useContainer` - Auto-wrap in Container (default: true)
- `containerSize` - Container size when useContainer=true (default: "2xl")

### Container Component

Controls horizontal constraints and centering:

```tsx
<Container
  size="lg"                           // Max-width: sm|md|lg|xl|2xl|fluid
  px={{ base: 4, md: 6, lg: 8 }}     // Responsive horizontal padding
  py={0}                              // Vertical padding
  center={true}                       // Center with auto margins
>
  {children}
</Container>
```

**Props:**
- `size` - Max-width preset (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px, fluid: 100%)
- `px`, `py` - Panda spacing tokens or responsive objects
- `center` - Center horizontally (default: true)

## Common Patterns

### Pattern 1: Standard Content Page

```tsx
export default function ContentPage() {
  return (
    <Section pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 24 }} fullWidth containerSize="2xl">
      <Container size="lg" px={{ base: 4, md: 6, lg: 8 }}>
        <Headline level={1}>Page Title</Headline>
        <Paragraph>Page content...</Paragraph>
      </Container>
    </Section>
  );
}
```

### Pattern 2: Full-Width Hero + Content

```tsx
export default function LandingPage() {
  return (
    <>
      {/* Full-width hero */}
      <Section pt={0} pb={0} fullWidth useContainer={false}>
        <HeroImage src="/hero.jpg" />
      </Section>

      {/* Contained content */}
      <Section pt={16} pb={16} fullWidth containerSize="2xl">
        <Container size="lg" px={{ base: 4, md: 6, lg: 8 }}>
          <Headline>About</Headline>
          <Paragraph>Content...</Paragraph>
        </Container>
      </Section>
    </>
  );
}
```

### Pattern 3: Mixed Container Sizes

```tsx
export default function ProjectPage() {
  return (
    <>
      {/* Wide header */}
      <Section pt={16} pb={8} fullWidth containerSize="2xl">
        <Container size="xl" px={{ base: 4, md: 6 }}>
          <Headline level={1}>Project Title</Headline>
        </Container>
      </Section>

      {/* Narrow reading content */}
      <Section pt={8} pb={16} fullWidth containerSize="2xl">
        <Container size="md" px={{ base: 4, md: 6 }}>
          <Paragraph>Long form content optimized for reading...</Paragraph>
        </Container>
      </Section>

      {/* Full-width gallery */}
      <Section pt={16} pb={16} fullWidth useContainer={false}>
        <ImageGallery />
      </Section>
    </>
  );
}
```

### Pattern 4: Storyblok Dynamic Page

```tsx
export default async function StoryblokPage({ params }) {
  const story = await getStory(params.slug);

  return <DynamicRender data={story.content} />;
}

// Each Storyblok component handles its own Section/Container
// Example: Hero component
export const Hero = ({ blok }) => (
  <Section pt={0} pb={16} fullWidth useContainer={false}>
    <Image src={blok.image} alt={blok.alt} />
    <Container size="lg" px={4}>
      <Headline>{blok.title}</Headline>
    </Container>
  </Section>
);

// Example: Text component
export const Text = ({ blok }) => (
  <Section pt={16} pb={16} fullWidth containerSize="2xl">
    <Container size="md" px={{ base: 4, md: 6 }}>
      <RichText>{blok.content}</RichText>
    </Container>
  </Section>
);
```

## Spacing Guidelines

### Panda Spacing Tokens

Common values (in px):
- `4` = 16px (1rem)
- `6` = 24px (1.5rem)
- `8` = 32px (2rem)
- `12` = 48px (3rem)
- `16` = 64px (4rem)
- `24` = 96px (6rem)

### Responsive Spacing

```tsx
// Mobile-first responsive padding
<Section
  pt={{ base: 8, md: 16, lg: 24 }}
  pb={{ base: 8, md: 16, lg: 24 }}
/>

// Horizontal padding
<Container px={{ base: 4, md: 6, lg: 8 }} />
```

## Error States

Always wrap error components in Container/Section:

```tsx
export default function Error({ error, reset }) {
  return (
    <Section pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 24 }}>
      <Container size="lg" px={{ base: 4, md: 6 }}>
        <Headline>Error</Headline>
        <Button onClick={reset}>Try Again</Button>
      </Container>
    </Section>
  );
}
```

## Loading States

Always wrap loading components in Container/Section:

```tsx
export default function Loading() {
  return (
    <Section pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 24 }}>
      <Container size="lg" px={{ base: 4, md: 6 }}>
        <Loading />
      </Container>
    </Section>
  );
}
```

## Why This Pattern?

### ✅ Benefits

1. **Flexible Layouts** - Each page controls its container strategy
2. **Full-Width Sections** - Easy to break out of containers
3. **Storyblok Compatible** - CMS components control their own layout
4. **Consistent Spacing** - Token-based responsive spacing
5. **Predictable Structure** - Clear ownership of layout decisions

### ❌ Anti-Patterns to Avoid

1. Adding Container to root layout - prevents full-width sections
2. Hardcoded pixel values - use spacing tokens instead
3. Inconsistent loading/error states - must match page structure
4. Missing responsive padding - mobile needs smaller values
5. Forgetting Section wrapper - creates spacing inconsistencies

## Migration Checklist

When creating a new page:

- [ ] No Container in layout.tsx
- [ ] Page uses Section for vertical spacing
- [ ] Page uses Container for horizontal constraints
- [ ] Responsive padding tokens used (not px values)
- [ ] Loading state matches page structure
- [ ] Error state matches page structure
- [ ] Full-width sections use `useContainer={false}`
- [ ] Mixed container sizes where appropriate

## Questions?

See examples in:
- `apps/web/app/page.tsx` - Homepage with Storyblok
- `apps/web/app/(portfolio)/loading.tsx` - Loading state
- `apps/web/app/(portfolio)/error.tsx` - Error state
- `packages/ui/src/components/section/section.tsx` - Section component
- `packages/ui/src/components/container/container.tsx` - Container component
