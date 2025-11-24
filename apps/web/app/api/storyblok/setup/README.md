# Storyblok Setup API

Diese API Route erstellt automatisch alle benötigten Storyblok-Komponenten für die Config Story.

## Verwendung

### 1. Management Token erhalten

1. Gehe zu [Storyblok Settings → Access Tokens](https://app.storyblok.com/#!/me/account)
2. Erstelle einen neuen **Personal Access Token** mit `write` Permission
3. Kopiere den Token

### 2. Setup ausführen

**Option A: Mit curl**

```bash
curl -X POST https://localhost:3000/api/storyblok/setup \
  -H "Content-Type: application/json" \
  -d '{"token":"dein-management-token-hier"}'
```

**Option B: Mit fetch in Browser DevTools**

```javascript
fetch('/api/storyblok/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'dein-management-token-hier' })
}).then(r => r.json()).then(console.log)
```

**Option C: Token in .env.local**

```bash
# .env.local
STORYBLOK_MANAGEMENT_TOKEN=dein-management-token-hier
```

Dann einfach:
```bash
curl -X POST https://localhost:3000/api/storyblok/setup
```

### 3. Response

Erfolgreiche Response:
```json
{
  "message": "Setup completed: 4 components created, 0 failed",
  "results": [
    { "component": "menu_link", "status": 201, "data": {...} },
    { "component": "social_link", "status": 201, "data": {...} },
    { "component": "footer_config", "status": 201, "data": {...} },
    { "component": "config", "status": 201, "data": {...} }
  ],
  "nextSteps": [
    "Go to Storyblok Content → New Entry",
    "Create a new 'Config' story with slug 'config'",
    "Add menu_link blocks to header_menu field",
    "Publish the Config story"
  ]
}
```

## Was wird erstellt?

### 1. `menu_link` (Block)
- **label** (text, required): Text der im Menü angezeigt wird
- **link** (multilink, required): Interner oder externer Link
- **target** (option): `_self` oder `_blank`

### 2. `social_link` (Block)
- **platform** (option): Instagram, Twitter, GitHub, LinkedIn, YouTube, Facebook
- **url** (text, required): URL zum Social Media Profil

### 3. `footer_config` (Block)
- **copyright_text** (text): Z.B. "© 2025 httpjpg. All rights reserved."
- **show_default_links** (boolean): Legal/Privacy Links anzeigen
- **social_links** (bloks): Array von social_link Blocks
- **background_image** (asset): Optionales Hintergrundbild

### 4. `config` (Content Type)
- **site_name** (text): Name der Website
- **header_menu** (bloks, required): Array von menu_link Blocks
- **footer_config** (bloks, max 1): Ein footer_config Block
- **seo_title** (text): Globaler SEO Title
- **seo_description** (textarea): Globale SEO Description

## Nächste Schritte nach Setup

1. Gehe zu **Storyblok Content → New Entry**
2. Wähle **Config** als Content Type
3. Slug: `config` (wichtig!)
4. Füge menu_link Blocks hinzu:
   - Label: "Home", Link: `/`, Target: `_self`
   - Label: "Work", Link: `/work`, Target: `_self`
   - Label: "About", Link: `/about`, Target: `_self`
   - Label: "Contact", Link: `/contact`, Target: `_self`
5. Optional: Füge footer_config Block hinzu mit Social Links
6. **Publish** die Config Story

## Troubleshooting

### "Management token required"
- Stelle sicher, dass du entweder den Token im Request Body mitschickst ODER `STORYBLOK_MANAGEMENT_TOKEN` in `.env.local` gesetzt hast

### "Invalid Storyblok token"
- Prüfe ob `NEXT_PUBLIC_STORYBLOK_TOKEN` korrekt gesetzt ist

### Status 422: "Component already exists"
- Die Komponente existiert bereits in Storyblok
- Du kannst sie manuell löschen und das Setup erneut ausführen
- Oder: Passe die bestehende Komponente manuell an

### Status 401: "Unauthorized"
- Der Management Token ist ungültig oder abgelaufen
- Erstelle einen neuen Personal Access Token mit `write` Permission

## Sicherheit

⚠️ **Wichtig**: Diese API Route sollte nur in Development verwendet werden!

Für Production:
- Lösche die Route oder schütze sie mit Authentication
- Verwende den Management Token nur lokal, nie in Git committen
- Nach dem Setup kann der Token wieder gelöscht werden
