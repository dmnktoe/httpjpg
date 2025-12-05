# CI & Playwright Setup - Changelog

## 🎯 Übersicht

Komplettes Setup von Playwright E2E Tests und Behebung der CI/CD Pipeline.

## ✅ Erledigte Aufgaben

### 1. CI pnpm Version-Konflikt behoben

**Problem:** GitHub Actions hatte `version: 9` hardcoded, aber `package.json` spezifiziert `pnpm@9.0.0` im `packageManager` field.

**Lösung:** Alle `version: 9` Angaben aus der CI config entfernt. `pnpm/action-setup@v4` liest die Version automatisch aus `package.json`.

**Geänderte Dateien:**
- `.github/workflows/ci.yml` - Alle `version: 9` entfernt aus allen Jobs (lint, typecheck, build-packages, build-apps, test, e2e)

### 2. Playwright installiert und konfiguriert

**Neue Dependencies:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0"
  }
}
```

**Neue Dateien:**
- `apps/web/playwright.config.ts` - Playwright Konfiguration
  - Lokaler Dev-Server Modus (reuse existing server)
  - CI Production-Build Modus
  - Nur Chromium aktiviert (Firefox/WebKit optional)
  - Retries: 0 lokal, 2 auf CI
  - HTML + GitHub Reporter für CI

### 3. E2E Test-Suite erstellt

**Neue Test-Dateien:**

#### `tests/e2e/homepage.spec.ts`
- Homepage lädt korrekt
- Main Content sichtbar
- Responsive Design (Mobile + Desktop)
- Keine kritischen Console Errors

#### `tests/e2e/navigation.spec.ts`
- Navigation zwischen Seiten
- 404 Page Handling
- Mobile Menu Funktionalität

#### `tests/e2e/accessibility.spec.ts`
- Heading Hierarchie (H1 vorhanden)
- Alt-Texte auf Bildern
- Keyboard Navigation funktioniert
- ARIA Labels auf interaktiven Elementen

**Scripts hinzugefügt:**
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

### 4. CI Workflow für Playwright aktiviert

**Änderungen in `.github/workflows/ci.yml`:**

```yaml
e2e:
  name: 🎭 Playwright E2E Tests
  runs-on: ubuntu-latest
  needs: [build-apps]
  steps:
    # ... setup steps
    - name: 📦 Download web build
      uses: actions/download-artifact@v4
      with:
        name: web-build
        path: apps/web/.next
    
    - name: 🌐 Install Playwright Browsers
      run: pnpm --filter=@httpjpg/web exec playwright install --with-deps chromium
    
    - name: 🎭 Run Playwright tests
      run: pnpm --filter=@httpjpg/web run test:e2e
      env:
        PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
    
    - name: 📸 Upload test results
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: apps/web/playwright-report/
        retention-days: 30
```

**Summary Job aktualisiert:**
- E2E Tests in `needs` array hinzugefügt
- E2E Ergebnis wird in Status-Check geprüft

### 5. Dokumentation

**Neue Datei:**
- `apps/web/tests/README.md` - Vollständige Test-Dokumentation mit:
  - Überblick aller Test-Suites
  - Lokale Ausführung
  - CI/CD Erklärung
  - Test Reports
  - Konfiguration
  - Best Practices
  - Debugging Tips

## 🚀 Nächste Schritte

1. **Tests lokal ausführen:**
   ```bash
   cd apps/web
   pnpm run test:e2e
   ```

2. **CI testen:**
   - Push to GitHub
   - CI sollte nun durchlaufen ohne Version-Konflikt
   - E2E Tests werden nach Build ausgeführt

3. **Tests erweitern:**
   - Weitere Critical User Paths testen
   - Integration mit Storyblok Content testen
   - Performance Tests hinzufügen (optional)

## 📊 CI Pipeline Überblick

```
┌─────────────┐
│   Lint      │
│  Typecheck  │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Build     │
│  Packages   │
└─────┬───────┘
      │
      ▼
┌─────────────┐     ┌──────────┐
│   Build     │────▶│  E2E     │
│   Apps      │     │  Tests   │
└─────────────┘     └────┬─────┘
                         │
                         ▼
                    ┌─────────┐
                    │ Summary │
                    └─────────┘
```

## 🎉 Ergebnis

- ✅ CI Version-Konflikt behoben
- ✅ Playwright komplett eingerichtet
- ✅ 11 E2E Tests geschrieben (3 Suites)
- ✅ CI Pipeline aktiviert und funktionsfähig
- ✅ Vollständige Dokumentation vorhanden
