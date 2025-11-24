# Storyblok Integration Best Practices

Diese Next.js App folgt den offiziellen Storyblok Best Practices für optimale Performance und Developer Experience.

## ✅ Implementierte Best Practices

### 1. **ISR (Incremental Static Regeneration)**
- Alle Seiten nutzen `revalidate: 3600` (1 Stunde)
- Cache-Tags für granulare Revalidierung
- `dynamicParams = true` für neue Stories nach Build

### 2. **Caching Strategy**
- `unstable_cache` für Server Component Caching
- Separate Cache-Keys pro Story: `story-${slug}`
- Cache-Tags: `CACHE_TAGS.STORY(slug)`, `CACHE_TAGS.STORIES`
- Draft Mode deaktiviert Caching automatisch

### 3. **Draft Mode Integration**
- `/api/draft` Route für Visual Editor
- `/api/exit-draft` zum Beenden
- Middleware erkennt `_storyblok` Parameter automatisch
- Preview Notification Banner in Portfolio Layout

### 4. **Webhook Revalidation**
- `/api/revalidate` Endpoint mit Type Safety
- Validiert webhook-secret Header
- Revalidiert Story-spezifische Cache-Tags
- Revalidiert Path mit `revalidatePath()`
- Settings-Story revalidiert gesamtes Layout

### 5. **Type Safety**
```typescript
interface StoryblokWebhookPayload {
  action: "published" | "unpublished" | "deleted";
  story?: {
    id: number;
    name: string;
    slug: string;
    full_slug: string;
  };
}
```

### 6. **Error Handling**
- Error Boundary für Storyblok Components
- Sentry Integration für Fehler-Tracking
- Graceful Fallbacks bei API-Fehlern
- Try-Catch in `generateStaticParams`

### 7. **Security**
- Content-Security-Policy Header für Visual Editor
- Secret-Validierung in Draft/Revalidate Routes
- Environment Variable Validation

### 8. **Performance**
- React.memo für alle Storyblok Components
- Parallel Fetching in generateStaticParams
- Image Optimization über Storyblok CDN
- Cache-first Strategy in Production

## 📋 Setup Checklist

### Environment Variables (.env.local)
```bash
# Public token für published content
NEXT_PUBLIC_STORYBLOK_TOKEN=your_public_token

# Preview token für draft content (optional)
STORYBLOK_PREVIEW_TOKEN=your_preview_token

# Version: "published" oder "draft"
NEXT_PUBLIC_STORYBLOK_VERSION=published

# Secrets für Draft Mode & Webhooks
STORYBLOK_PREVIEW_SECRET=your_random_secret_1
STORYBLOK_REVALIDATE_SECRET=your_random_secret_2
```

### Storyblok Visual Editor Setup
1. **Settings → Visual Editor**
2. **Default Environment:** 
   ```
   https://localhost:3000/api/draft?secret=YOUR_PREVIEW_SECRET&slug=
   ```
3. **Location (Feld):** `slug`

### Webhook Setup
1. **Settings → Webhooks → Add Webhook**
2. **Story published:**
   ```
   https://yourdomain.com/api/revalidate
   ```
3. **Headers:**
   ```
   webhook-secret: YOUR_REVALIDATE_SECRET
   ```
4. **Triggers:** 
   - ✅ Story published
   - ✅ Story unpublished
   - ✅ Story deleted

## 🗂️ File Structure

```
apps/web/app/
├── (portfolio)/              # Portfolio route group
│   ├── [...slug]/           # Catch-all für alle Stories
│   │   └── page.tsx         # Dynamic Story Rendering
│   ├── layout.tsx           # Preview Notification
│   ├── loading.tsx          # Loading UI
│   └── not-found.tsx        # 404 Page
├── api/
│   ├── draft/              # Visual Editor Integration
│   ├── exit-draft/         # Draft Mode beenden
│   └── revalidate/         # Webhook Handler
├── page.tsx                # Homepage (slug: "home")
├── layout.tsx              # Root Layout mit Navigation
└── storyblok-provider.tsx  # Bridge Loader

lib/
├── storyblok-cache.ts      # Cached API Utilities
├── storyblok-config.ts     # Environment Validation
└── get-settings.ts         # Settings Story Loader

middleware.ts               # Storyblok Parameter Handler
```

## 🔧 Component Registration

```typescript
// app/storyblok-provider.tsx
const components = {
  // Page types
  page: SbPage,
  work: SbPageWork,
  
  // Layout
  container: SbContainer,
  section: SbSection,
  grid: SbGrid,
  
  // Content
  image: SbImage,
  text: SbText,
  video: SbVideo,
  slideshow: SbSlideshow,
  
  // Config
  settings: SbSettings,
};
```

## 📊 Cache Strategy

### Production (published)
```typescript
unstable_cache(
  async () => getStory({ slug }),
  [`story-${slug}`],
  {
    tags: [CACHE_TAGS.STORY(slug), CACHE_TAGS.STORIES],
    revalidate: 3600,
  }
)
```

### Draft Mode (preview)
```typescript
// No caching, always fresh data
getStoryblokApi({ draftMode: true }).getStory({ slug })
```

## 🚀 Deployment

1. **Vercel/Production Environment Variables:**
   - Alle `.env.local` Variablen hinzufügen
   - `NEXT_PUBLIC_APP_URL` auf Production Domain setzen

2. **Nach Deployment:**
   - Storyblok Visual Editor URL auf Production URL ändern
   - Webhook URL auf Production Domain setzen
   - Test: Story publizieren → Revalidation prüfen

## 📚 Weitere Ressourcen

- [Storyblok Next.js Guide](https://www.storyblok.com/docs/guide/essentials/visual-editor)
- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Storyblok Webhooks](https://www.storyblok.com/docs/guide/in-depth/webhooks)
