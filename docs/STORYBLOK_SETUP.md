# Storyblok Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
# Storyblok API Token (Public)
NEXT_PUBLIC_STORYBLOK_TOKEN=your_public_token

# Storyblok Preview Secret (for Draft Mode)
STORYBLOK_PREVIEW_SECRET=your_random_secret_here

# Storyblok Revalidate Secret (for Webhooks)
STORYBLOK_REVALIDATE_SECRET=your_random_secret_here

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 1. Draft Mode / Preview Setup

Enable live preview in Storyblok:

1. Go to **Settings → Visual Editor**
2. Set **Preview URL** to:
   ```
   https://yourdomain.com/api/draft?secret=YOUR_PREVIEW_SECRET&slug=
   ```
3. Make sure to replace `YOUR_PREVIEW_SECRET` with your actual secret from `.env`

### How it works:
- When clicking "Preview" in Storyblok, users are redirected to your site with draft mode enabled
- The `/api/draft` route validates the secret and enables Next.js Draft Mode
- Users see unpublished changes in real-time

## 2. Webhook Setup (ISR Revalidation)

Set up webhooks to automatically revalidate content when published:

1. Go to **Settings → Webhooks**
2. Click **Create Webhook**
3. Configure:
   - **Name**: Production Revalidation
   - **Story published/unpublished**: ✅ Enable
   - **Story deleted**: ✅ Enable
   - **Endpoint**: `https://yourdomain.com/api/revalidate`
   - **Secret**: Your `STORYBLOK_REVALIDATE_SECRET` value

### Custom Headers:
Add this header to the webhook:
```
webhook-secret: YOUR_REVALIDATE_SECRET
```

### How it works:
- When a story is published/unpublished in Storyblok, a POST request is sent to `/api/revalidate`
- The route validates the secret and revalidates the specific story cache
- Next.js ISR will regenerate the page on the next request

## 3. Component Mapping

All Storyblok components are registered in:
```
apps/web/app/storyblok-provider.tsx
```

### Available Components:
- `SbPage` - Full page layout
- `SbPageWork` - Portfolio work detail page
- `SbSection` - Layout section
- `SbGrid` - Grid layout
- `SbGridItem` - Grid item
- `SbImage` - Responsive image
- `SbText` - Rich text content
- `SbWorkList` - Portfolio work list

### Adding New Components:

1. Create component in `packages/storyblok-ui/src/components/`
2. Export from `packages/storyblok-ui/src/index.ts`
3. Register in `apps/web/app/storyblok-provider.tsx`:

```tsx
const componentsMap = {
  // ... existing
  your_component_name: YourComponent,
};
```

## 4. Content Structure

### Portfolio Work Item:
```
Content Type: PageWork
Fields:
- title (Text)
- description (Rich Text) - Used for SEO and cards
- images (Asset - Multiple) - First image used for OG image
- date (Date) - Optional custom date
- link (Link) - Optional external link
- body (Blocks) - Dynamic content blocks
```

### Work List:
```
Content Type: WorkList
Fields:
- work (Multi-Options/Stories - Reference to PageWork items)
```

## 5. SEO & Metadata

Dynamic pages automatically generate:
- **Title**: From `story.content.title` or `story.name`
- **Description**: Extracted from rich text description (max 160 chars)
- **OG Image**: First image from work item (resized to 1200x630)
- **Twitter Card**: Summary with large image

## 6. Testing

### Test Draft Mode:
1. Create unpublished changes in Storyblok
2. Click "Preview" button
3. Verify you see unpublished changes

### Test Webhooks:
1. Publish a story in Storyblok
2. Check your deployment logs for "Revalidated: {slug}"
3. Visit the page and verify changes are visible

### Local Testing:
```bash
# Use ngrok or similar to expose localhost
ngrok http 3000

# Update webhook URL to:
https://your-ngrok-url.app/api/revalidate
```

## 7. Cache Strategy

- **Static Generation (SSG)**: All stories pre-rendered at build time
- **ISR Revalidation**: 1 hour default (`revalidate = 3600`)
- **On-Demand Revalidation**: Triggered by webhooks
- **Draft Mode**: Bypasses cache for preview

## Troubleshooting

### "Invalid secret" error:
- Verify `STORYBLOK_PREVIEW_SECRET` or `STORYBLOK_REVALIDATE_SECRET` matches
- Check that custom header `webhook-secret` is set correctly

### Changes not visible after publish:
- Check webhook logs in Storyblok
- Verify webhook endpoint is accessible (not 404/500)
- Check deployment logs for revalidation confirmations

### Preview not working:
- Ensure Draft Mode is enabled in the route
- Check that preview URL includes the correct secret
- Verify slug parameter is passed correctly
