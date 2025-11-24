# Local HTTPS Development

## 🔐 HTTPS-Zertifikate für lokale Entwicklung

Die Zertifikate wurden mit [mkcert](https://github.com/FiloSottile/mkcert) erstellt und sind gültig bis zum **24. Februar 2028**.

## 🚀 Usage

### Normale Entwicklung (HTTP)
```bash
pnpm dev
```
Läuft auf: http://localhost:3000

### HTTPS Entwicklung (für Storyblok Visual Editor)
```bash
pnpm dev:https
```
Läuft auf: https://localhost:3000

## 📝 Storyblok Visual Editor Setup

1. Starte den Dev-Server mit HTTPS:
   ```bash
   cd apps/web
   pnpm dev:https
   ```

2. Öffne Storyblok im Browser und gehe zu:
   - Settings → Visual Editor
   - Default Environment: `https://localhost:3000/`

3. Öffne einen Story und klicke auf "Open in Visual Editor"

## 🔧 Troubleshooting

### Zertifikat wird nicht vertraut
```bash
# CA neu installieren
mkcert -install

# Zertifikate neu erstellen
cd .certificates
rm localhost+2*
mkcert localhost 127.0.0.1 ::1
```

### Port bereits belegt
```bash
# Port 3000 freigeben
lsof -ti:3000 | xargs kill -9
```

### Browser zeigt Warnung
- Chrome: Tippe `thisisunsafe` wenn die Warnung erscheint
- Safari: Klicke auf "Details anzeigen" → "Website besuchen"
- Firefox: Klicke auf "Erweitert" → "Risiko akzeptieren"

## 📦 Zertifikate

Die Zertifikate befinden sich in `.certificates/`:
- `localhost+2.pem` - Certificate
- `localhost+2-key.pem` - Private Key

⚠️ Diese Dateien sind in `.gitignore` und werden **nicht** committed!

## 🔒 Sicherheit

- Zertifikate sind nur lokal gültig
- Werden von mkcert's lokaler CA signiert
- Nicht für Production verwenden
- Automatisch am 24.02.2028 abgelaufen

## 🌐 Alternativen

Wenn du keine HTTPS brauchst:
- Nutze `pnpm dev` für normale HTTP-Entwicklung
- Storyblok Visual Editor funktioniert auch mit HTTP (aber mit Einschränkungen)
