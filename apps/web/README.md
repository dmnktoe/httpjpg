# httpjpg Web App

Next.js 15 App Router + Storyblok CMS powered portfolio website.

## Features

- ✅ **Next.js 15 App Router** with TypeScript
- ✅ **Storyblok CMS** with Visual Editor support
- ✅ **Panda CSS** for zero-runtime styling
- ✅ **ISR (Incremental Static Regeneration)** with on-demand revalidation
- ✅ **Draft Mode** for preview
- ✅ **Dynamic Sitemap & Robots.txt** from Storyblok content
- ✅ **SEO Optimized** with Open Graph & Twitter Cards
- ✅ **Google Analytics** integration
- ✅ **Sentry** error tracking

## Project Structure

```
app/
├── (portfolio)/          # Route group with preview notification
│   ├── [...slug]/        # Dynamic catch-all for all pages
│   │   └── page.tsx      # Renders any Storyblok story
│   ├── layout.tsx        # Portfolio layout with preview
│   ├── loading.tsx       # Loading state
│   └── not-found.tsx     # 404 page
├── api/
│   ├── draft/            # Enable draft mode
│   ├── exit-draft/       # Disable draft mode
│   └── revalidate/       # Webhook for on-demand revalidation
├── components/
│   └── preview-notification.tsx  # Draft mode banner
├── layout.tsx            # Root layout with Storyblok Provider
├── page.tsx              # Homepage (loads "home" story)
├── sitemap.ts            # Dynamic sitemap from Storyblok
├── robots.ts             # Robots.txt with sitemap link
└── storyblok-provider.tsx  # Storyblok component registration
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., https://httpjpg.com)
- `NEXT_PUBLIC_STORYBLOK_TOKEN` - Storyblok public access token
- `STORYBLOK_PREVIEW_SECRET` - Random secret for draft mode
- `STORYBLOK_REVALIDATE_SECRET` - Random secret for webhooks

See [Storyblok Setup Guide](../../docs/STORYBLOK_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

All routes are dynamically generated from Storyblok:

- `/` → Home page (story slug: "home")
- `/work/*` → Portfolio work items
- `/about` → About page
- `/contact` → Contact page
- Any other story slug

## Storyblok Integration

### Component Mapping

All Storyblok components are registered in `app/storyblok-provider.tsx`:

```tsx
const componentsMap = {
  page: SbPage,
  page_work: SbPageWork,
  section: SbSection,
  grid: SbGrid,
  grid_item: SbGridItem,
  image: SbImage,
  text: SbText,
  work_list: SbWorkList,
};
```

### Adding New Components

1. Create component in `packages/storyblok-ui/src/components/`
2. Export from `packages/storyblok-ui/src/index.ts`
3. Register in `app/storyblok-provider.tsx`
4. Create matching component in Storyblok

### Preview Mode

Enable live preview in Storyblok Visual Editor:

**Settings → Visual Editor → Preview URL:**
```
https://yourdomain.com/api/draft?secret=YOUR_SECRET&slug=
```

### Webhooks

Configure automatic revalidation on publish:

**Settings → Webhooks:**
- **Endpoint:** `https://yourdomain.com/api/revalidate`
- **Secret Header:** `webhook-secret: YOUR_SECRET`
- **Triggers:** Story published/unpublished

## Build & Deploy

### Build for Production

```bash
pnpm build
```

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform (Vercel, etc.):

```bash
NEXT_PUBLIC_APP_URL=https://httpjpg.com
NEXT_PUBLIC_STORYBLOK_TOKEN=your_public_token
STORYBLOK_PREVIEW_TOKEN=your_preview_token
STORYBLOK_PREVIEW_SECRET=your_secret
STORYBLOK_REVALIDATE_SECRET=your_secret
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dmnktoe/httpjpg)

## Performance

- **ISR Revalidation:** 1 hour default (`revalidate = 3600`)
- **On-Demand Revalidation:** Via webhooks
- **Static Generation:** All pages pre-rendered at build time
- **Zero-Runtime CSS:** Panda CSS extracts styles at build time

## Monitoring

- **Google Analytics:** Set `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Sentry:** Configure in `sentry.*.config.ts`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Panda CSS Documentation](https://panda-css.com)
- [Storyblok Setup Guide](../../docs/STORYBLOK_SETUP.md)
