# Storyblok Schema Setup

## Content Types

### 1. `page` (Content Type)
**Name:** Page  
**Technical Name:** `page`  
**Type:** Content Type  
**Preview Field:** `title`

**Schema:**
```json
{
  "title": { "type": "text", "required": true },
  "description": { "type": "textarea" },
  "body": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["section", "text", "image", "grid", "slideshow"] }
}
```

---

### 2. `work` (Content Type)
**Name:** Work  
**Technical Name:** `work`  
**Type:** Content Type  
**Preview Field:** `title`

**Schema:**
```json
{
  "title": { "type": "text", "required": true },
  "description": { "type": "textarea" },
  "client": { "type": "text" },
  "year": { "type": "number" },
  "tags": { "type": "text" },
  "thumbnail": { "type": "asset", "filetypes": ["images"] },
  "body": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["section", "text", "image", "grid", "slideshow"] }
}
```

---

### 3. `config` (Content Type)
**Name:** Config  
**Technical Name:** `config`  
**Type:** Content Type  
**Preview Field:** `site_name`

**Schema:**
```json
{
  "site_name": { "type": "text", "required": true },
  "navigation": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["menu_link"] },
  "footer_copyright": { "type": "text" },
  "footer_background_image": { "type": "asset", "filetypes": ["images"] },
  "show_default_links": { "type": "boolean", "default": true }
}
```

---

## Nestable Blocks

### 1. `section` (Nestable Block)
**Name:** Section  
**Technical Name:** `section`  
**Category:** Layout  
**Icon:** Layout  
**Color:** Blue

**Schema:**
```json
{
  "background_color": { "type": "option", "options": [
    { "value": "white", "name": "White" },
    { "value": "black", "name": "Black" },
    { "value": "gray", "name": "Gray" }
  ], "default": "white" },
  "full_width": { "type": "boolean", "default": false },
  "padding_top": { "type": "option", "options": [
    { "value": "none", "name": "None" },
    { "value": "small", "name": "Small" },
    { "value": "medium", "name": "Medium" },
    { "value": "large", "name": "Large" }
  ], "default": "medium" },
  "padding_bottom": { "type": "option", "options": [
    { "value": "none", "name": "None" },
    { "value": "small", "name": "Small" },
    { "value": "medium", "name": "Medium" },
    { "value": "large", "name": "Large" }
  ], "default": "medium" },
  "body": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["text", "image", "grid", "slideshow"] }
}
```

---

### 2. `text` (Nestable Block)
**Name:** Text  
**Technical Name:** `text`  
**Category:** Content  
**Icon:** Text  
**Color:** Green

**Schema:**
```json
{
  "text": { "type": "richtext", "required": true },
  "align": { "type": "option", "options": [
    { "value": "left", "name": "Left" },
    { "value": "center", "name": "Center" },
    { "value": "right", "name": "Right" }
  ], "default": "left" }
}
```

---

### 3. `image` (Nestable Block)
**Name:** Image  
**Technical Name:** `image`  
**Category:** Media  
**Icon:** Image  
**Color:** Purple

**Schema:**
```json
{
  "image": { "type": "asset", "filetypes": ["images"], "required": true },
  "alt": { "type": "text" },
  "caption": { "type": "text" },
  "width": { "type": "option", "options": [
    { "value": "small", "name": "Small (600px)" },
    { "value": "medium", "name": "Medium (900px)" },
    { "value": "large", "name": "Large (1200px)" },
    { "value": "full", "name": "Full Width" }
  ], "default": "full" }
}
```

---

### 4. `grid` (Nestable Block)
**Name:** Grid  
**Technical Name:** `grid`  
**Category:** Layout  
**Icon:** Grid  
**Color:** Blue

**Schema:**
```json
{
  "columns": { "type": "option", "options": [
    { "value": "2", "name": "2 Columns" },
    { "value": "3", "name": "3 Columns" },
    { "value": "4", "name": "4 Columns" }
  ], "default": "2" },
  "gap": { "type": "option", "options": [
    { "value": "small", "name": "Small" },
    { "value": "medium", "name": "Medium" },
    { "value": "large", "name": "Large" }
  ], "default": "medium" },
  "body": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["text", "image"] }
}
```

---

### 5. `slideshow` (Nestable Block)
**Name:** Slideshow  
**Technical Name:** `slideshow`  
**Category:** Media  
**Icon:** Image  
**Color:** Purple

**Schema:**
```json
{
  "images": { "type": "bloks", "restrict_type": "", "restrict_components": true, "component_whitelist": ["image"] },
  "autoplay": { "type": "boolean", "default": false },
  "interval": { "type": "number", "default": 5000 }
}
```

---

### 6. `menu_link` (Nestable Block)
**Name:** Menu Link  
**Technical Name:** `menu_link`  
**Category:** Navigation  
**Icon:** Link  
**Color:** Orange

**Schema:**
```json
{
  "label": { "type": "text", "required": true },
  "link": { "type": "multilink", "required": true },
  "is_external": { "type": "boolean", "default": false }
}
```

---

## Folder Structure

```
Content/
├── config           (1 Story: "Config")
├── pages/
│   ├── home         (slug: "home")
│   ├── about        (slug: "about")
│   └── contact      (slug: "contact")
└── work/
    ├── project-1    (slug: "work/project-1")
    ├── project-2    (slug: "work/project-2")
    └── ...
```

---

## Quick Setup Steps

### 1. Content Types erstellen
- Gehe zu "Block Library" → "Content Types"
- Erstelle `page`, `work`, `config` mit obigen Schemas

### 2. Blocks erstellen
- Gehe zu "Block Library" → "Blocks"
- Erstelle `section`, `text`, `image`, `grid`, `slideshow`, `menu_link`
- Weise Categories zu (Layout, Content, Media, Navigation)

### 3. Config Story erstellen
- Erstelle Story "Config" (Slug: `config`)
- Content Type: `config`
- Füge Navigation Items hinzu

### 4. Erste Seiten erstellen
- Erstelle "Home" (Slug: `home`, Content Type: `page`)
- Erstelle "About" (Slug: `about`, Content Type: `page`)
- Erstelle Work Items in Folder `work/`

### 5. Preview URLs konfigurieren
**Settings → Visual Editor**
```
Default: https://localhost:3000/api/draft?secret=dev-preview-secret-change-in-production&slug={SLUG}
```

### 6. Component Whitelist
Jeder Content Type sollte nur erlaubte Nested Blocks haben:
- `page.body`: section, text, image, grid, slideshow
- `work.body`: section, text, image, grid, slideshow
- `section.body`: text, image, grid, slideshow
- `grid.body`: text, image
- `slideshow.images`: image
- `config.navigation`: menu_link

---

## Best Practices

1. **Naming Convention:** PascalCase für Display Names, snake_case für Technical Names
2. **Required Fields:** Nur wirklich notwendige Felder als required markieren
3. **Component Whitelist:** Immer restrict_components aktivieren für saubere Content-Struktur
4. **Preview Fields:** Aussagekräftige Felder für bessere Übersicht
5. **Categories:** Logische Gruppierung (Layout, Content, Media, Navigation)
6. **Colors:** Konsistente Farben pro Category (Blue=Layout, Green=Content, Purple=Media, Orange=Navigation)

---

## Validation Checklist

- [ ] Alle Content Types haben Preview Fields
- [ ] Alle Blocks haben Categories und Icons
- [ ] Component Whitelists sind konfiguriert
- [ ] Config Story existiert mit Navigation
- [ ] Home Story existiert (Slug: "home")
- [ ] Preview URLs sind konfiguriert
- [ ] Webhook für Revalidation ist eingerichtet

