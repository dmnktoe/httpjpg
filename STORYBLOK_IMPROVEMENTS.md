# 🎯 Storyblok Best Practices & Improvements

## ✅ Bereits implementiert
- [x] Type Safety (keine `as any`)
- [x] Performance-Optimierung (React.memo)
- [x] Error Boundary mit Sentry
- [x] Zentrale Type Definitions
- [x] Gecachte API-Calls

---

## 🔮 Weitere Verbesserungsvorschläge

### 1. **Storyblok Preview Mode Indicator**
```tsx
// components/preview-banner.tsx
'use client';

import { useEffect, useState } from 'react';

export function PreviewBanner() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsPreview(document.cookie.includes('__prerender_bypass'));
  }, []);

  if (!isPreview) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black text-center py-2 z-50 text-sm font-semibold">
      🔍 Storyblok Preview Mode - Changes are not published
    </div>
  );
}
```

### 2. **Component Not Found Handler**
```tsx
// components/storyblok-component-not-found.tsx
import { Box } from '@httpjpg/ui';

export function ComponentNotFound({ component }: { component: string }) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Box
      css={{
        p: '1rem',
        my: '1rem',
        bg: 'orange.100',
        border: '2px dashed orange.500',
        borderRadius: '0.5rem',
      }}
    >
      <strong>Component Not Found:</strong> {component}
      <br />
      <small>Register this component in storyblok-provider.tsx</small>
    </Box>
  );
}
```

### 3. **Storyblok Link Resolver**
```tsx
// lib/storyblok-link-resolver.ts
import type { StoryblokLink } from '@httpjpg/storyblok-ui';

export function resolveStoryblokLink(link?: StoryblokLink): string {
  if (!link) return '#';

  switch (link.linktype) {
    case 'story':
      return `/${link.cached_url || link.story?.full_slug || ''}`;
    case 'url':
      return link.url || '#';
    case 'asset':
      return link.url || '#';
    case 'email':
      return `mailto:${link.email || ''}`;
    default:
      return '#';
  }
}

export function isExternalLink(link?: StoryblokLink): boolean {
  if (!link) return false;
  if (link.linktype === 'url') {
    return link.url?.startsWith('http') || false;
  }
  return false;
}
```

### 4. **Storyblok Image Optimization Helper**
```tsx
// lib/storyblok-image-service.ts
export interface StoryblokImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'in' | 'out' | 'fill' | 'crop';
  focus?: string;
}

export function getStoryblokImageUrl(
  imageUrl: string,
  options: StoryblokImageOptions = {}
): string {
  if (!imageUrl || !imageUrl.includes('a.storyblok.com')) {
    return imageUrl;
  }

  const params = new URLSearchParams();

  if (options.width) params.append('m', `${options.width}x0`);
  if (options.height) params.append('m', `0x${options.height}`);
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);
  if (options.fit) params.append('fit', options.fit);
  if (options.focus) params.append('focus', options.focus);

  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${params.toString()}`;
}

// Usage:
// const optimizedUrl = getStoryblokImageUrl(image.filename, {
//   width: 800,
//   quality: 80,
//   format: 'webp'
// });
```

### 5. **Storyblok Relations Resolver**
```tsx
// lib/storyblok-relations.ts
export const STORYBLOK_RELATIONS = [
  'work-list.work',
  'page.related_content',
  // Add more relations as needed
] as const;

export type StoryblokRelation = typeof STORYBLOK_RELATIONS[number];
```

### 6. **Revalidation Webhook Handler**
```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // Validate secret
  if (secret !== process.env.STORYBLOK_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { story_id, slug, action } = body;

    console.log('Revalidating:', { story_id, slug, action });

    // Revalidate specific path
    if (slug) {
      revalidatePath(`/${slug}`);
    }

    // Revalidate cache tags
    revalidateTag('stories');
    revalidateTag(`story-${slug}`);

    return NextResponse.json({ 
      revalidated: true, 
      slug,
      now: Date.now() 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error },
      { status: 500 }
    );
  }
}
```

### 7. **Draft Mode Handler**
```tsx
// app/api/draft/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '';

  // Validate secret
  if (secret !== process.env.STORYBLOK_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // Enable Draft Mode
  (await draftMode()).enable();

  // Redirect to the path from Storyblok
  redirect(`/${slug}`);
}

// Disable draft mode
// app/api/disable-draft/route.ts
export async function GET() {
  (await draftMode()).disable();
  return new Response('Draft mode disabled');
}
```

### 8. **Storyblok Sitemap Generator**
```tsx
// app/sitemap.ts
import { getStoryblokApi } from '@httpjpg/storyblok-api';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const api = getStoryblokApi();
  const slugs = await api.getAllSlugs({ starts_with: '' });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://httpjpg.com';

  return slugs
    .filter((item) => !item.isFolder)
    .map((item) => ({
      url: `${baseUrl}/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: item.slug === 'home' ? 1 : 0.8,
    }));
}
```

### 9. **Visual Editor Helper**
```tsx
// lib/storyblok-bridge.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useStoryblokBridge(storyId: number, callback: () => void) {
  const router = useRouter();

  useEffect(() => {
    const storyblokInstance = (window as any).storyblok;

    if (!storyblokInstance) {
      return;
    }

    storyblokInstance.on(['input', 'published', 'change'], (event: any) => {
      if (event.action === 'input' && event.story?.id === storyId) {
        callback();
      }
      
      if (event.action === 'change') {
        router.refresh();
      }
    });

    storyblokInstance.pingEditor(() => {
      if (storyblokInstance.inEditor) {
        storyblokInstance.enterEditmode();
      }
    });
  }, [storyId, callback, router]);
}
```

### 10. **Storyblok Analytics Tracking**
```tsx
// lib/storyblok-analytics.ts
export function trackStoryblokEvent(
  action: string,
  story: { name: string; id: number; full_slug: string }
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'storyblok',
      event_label: story.name,
      story_id: story.id,
      story_slug: story.full_slug,
    });
  }
}
```

---

## 🎨 Empfohlene Storyblok Schema-Patterns

### Wiederverwendbare Field Groups
- **SEO Fields**: title, description, og_image, og_title, og_description
- **Spacing Fields**: pt, pb, mt, mb, py, my
- **Background Fields**: bgColor, bgImage, overlay
- **CTA Fields**: cta_text, cta_link, cta_style

### Naming Conventions
- Components: PascalCase (z.B. `HeroSection`, `ImageGallery`)
- Fields: snake_case (z.B. `bg_color`, `section_title`)
- Bloks: kebab-case (z.B. `hero-section`, `image-gallery`)

---

## 📚 Nützliche Resources
- [Storyblok Image Service](https://www.storyblok.com/docs/image-service)
- [Storyblok Relations](https://www.storyblok.com/docs/guide/essentials/relations)
- [Next.js Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode)
