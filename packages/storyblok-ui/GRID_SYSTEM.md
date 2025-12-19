# Enhanced Editorial Grid System

The enhanced grid system provides flexible, editorial-style layouts with CSS Grid. It includes two main components: `SbGrid` (container) and `SbGridItem` (items with precise positioning).

## Components

### SbGrid - Grid Container

The `SbGrid` component creates a responsive grid layout with configurable columns, gaps, and alignment.

#### Features

- **Responsive Columns**: Configure different column counts for mobile, tablet, and desktop
- **Custom Gaps**: Control row and column gaps independently
- **Alignment Control**: Set alignment and justification for grid items
- **Auto Flow**: Control how items are placed in the grid (row, column, dense)
- **Editorial Flexibility**: Support for asymmetric and magazine-style layouts

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `items` | `SbBlokData[]` | Grid items (required) |
| `columns` | `string` | Number of columns (1-12 or "auto") |
| `columnsMd` | `string` | Columns at tablet breakpoint |
| `columnsLg` | `string` | Columns at desktop breakpoint |
| `gap` | `string` | Gap between items |
| `rowGap` | `string` | Gap between rows (overrides gap) |
| `columnGap` | `string` | Gap between columns (overrides gap) |
| `alignItems` | `string` | Vertical alignment (start, center, end, stretch) |
| `justifyItems` | `string` | Horizontal alignment (start, center, end, stretch) |
| `justifyContent` | `string` | Distribution of grid tracks (start, center, end, space-between, space-around, space-evenly) |
| `autoFlow` | `string` | Grid auto flow (row, column, row dense, column dense) |
| `isList` | `boolean` | Render as semantic `<ul>` list |
| `pt`, `pb`, `mt`, `mb` | `string` | Padding/margin spacing |

#### Example Usage in Storyblok

**Simple 3-column grid:**
- Columns: `3`
- Gap: `Medium`

**Responsive editorial layout:**
- Columns: `1` (mobile: stacked)
- Columns (Tablet): `2` (tablet: 2 columns)
- Columns (Desktop): `3` (desktop: 3 columns)
- Gap: `Large`

**Magazine-style asymmetric layout:**
- Columns: `12` (use 12-column system)
- Gap: `Medium`
- Items: Use `SbGridItem` components with different spans

### SbGridItem - Grid Item with Positioning

The `SbGridItem` component provides precise control over grid item positioning and spanning. Use inside `SbGrid` for advanced editorial layouts.

#### Features

- **Column/Row Spanning**: Span multiple columns or rows
- **Responsive Spans**: Different spans for mobile, tablet, and desktop
- **Precise Positioning**: Set exact start/end positions
- **Nested Content**: Any Storyblok component can be placed inside
- **Magazine Layouts**: Create overlapping and asymmetric compositions

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `content` | `SbBlokData[]` | Nested content blocks |
| `colSpan` | `string` | Number of columns to span (1-12, full) |
| `colSpanMd` | `string` | Column span at tablet breakpoint |
| `colSpanLg` | `string` | Column span at desktop breakpoint |
| `rowSpan` | `string` | Number of rows to span |
| `rowSpanMd` | `string` | Row span at tablet breakpoint |
| `rowSpanLg` | `string` | Row span at desktop breakpoint |
| `colStart` | `string` | Starting column position |
| `colEnd` | `string` | Ending column position |
| `rowStart` | `string` | Starting row position |
| `rowEnd` | `string` | Ending row position |

#### Example Layouts

**Feature + 2 Columns Layout:**
```
Grid (12 columns):
├─ GridItem (colSpan: 12, colSpanLg: 8)
│  └─ Image (large feature image)
├─ GridItem (colSpan: 12, colSpanLg: 4)
│  └─ Headline + Paragraph
├─ GridItem (colSpan: 12, colSpanMd: 6)
│  └─ Text block
└─ GridItem (colSpan: 12, colSpanMd: 6)
   └─ Text block
```

**Magazine Hero Layout:**
```
Grid (12 columns):
├─ GridItem (colSpan: full, rowSpan: 2)
│  └─ Image (background)
├─ GridItem (colStart: 2, colEnd: 8, rowStart: 2)
│  └─ Headline (overlaid text)
└─ GridItem (colSpan: 12, colSpanLg: 6)
   └─ Paragraph
```

**Asymmetric Editorial Layout:**
```
Grid (12 columns, gap: Large):
├─ GridItem (colSpan: 12, colSpanMd: 7, colSpanLg: 8)
│  └─ Large Image
├─ GridItem (colSpan: 12, colSpanMd: 5, colSpanLg: 4, rowSpan: 2)
│  └─ Sidebar content
├─ GridItem (colSpan: 12, colSpanMd: 7, colSpanLg: 8)
│  └─ Text content
└─ GridItem (colSpan: 12)
   └─ Full-width CTA
```

## Storyblok Setup

### 1. Sync Components to Storyblok

Run the sync script to create/update the components in your Storyblok space:

```bash
pnpm --filter @httpjpg/storyblok-ui exec tsx scripts/sync-storyblok-components.ts
```

You'll need to set environment variables:
- `STORYBLOK_MANAGEMENT_TOKEN` - Your personal access token
- `STORYBLOK_SPACE_ID` - Your space ID

### 2. Configure Component Whitelists

In Storyblok Visual Editor:

1. Go to **Components** → **grid**
2. Edit the `items` field
3. Add allowed nested components to the whitelist (e.g., `grid_item`, `image`, `headline`, `paragraph`)

4. Go to **Components** → **grid_item**
5. Edit the `content` field
6. Add allowed nested components (e.g., `image`, `headline`, `paragraph`, `button`)

### 3. Create Datasources (Optional)

For better UX, create these datasources in Storyblok:

**grid-columns:**
- 1 Column
- 2 Columns
- 3 Columns
- 4 Columns
- 6 Columns
- 12 Columns
- Auto Fit

## Best Practices

1. **Start Simple**: Begin with basic column layouts before adding complexity
2. **Mobile First**: Always configure mobile layout first, then add responsive overrides
3. **Use Grid Items Sparingly**: For simple layouts, place content directly in Grid. Use GridItem only when you need precise control
4. **12-Column System**: Use 12 columns for maximum flexibility in editorial layouts
5. **Consistent Gaps**: Use spacing tokens (xs, sm, md, lg, xl) for consistent design
6. **Test Responsiveness**: Preview at different breakpoints to ensure layout works across devices

## Troubleshooting

**Items not appearing in grid:**
- Check that the `items` field has content
- Verify component whitelists are configured
- Check browser console for Storyblok bridge errors

**Layout not responsive:**
- Ensure `columnsMd` and `columnsLg` are set if you want responsive behavior
- Use responsive span fields on `GridItem` components

**Overlapping content:**
- Check `colStart`/`colEnd` values don't conflict
- Verify `rowSpan` values when using multiple rows
- Use grid inspector in browser DevTools to debug positioning

## Migration from Old Grid

The old grid component is fully backward compatible. New features include:

- ✅ `columnsLg` - Desktop column configuration
- ✅ `rowGap` / `columnGap` - Independent gap control
- ✅ `alignItems` / `justifyItems` / `justifyContent` - Alignment options
- ✅ `autoFlow` - Grid flow control
- ✅ `grid_item` component - Precise item positioning

No changes required to existing content. New features can be adopted incrementally.
