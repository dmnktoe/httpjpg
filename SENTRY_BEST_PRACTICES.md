# Sentry Best Practices Setup

## ✅ Implementierte Best Practices

### 1. **Environment-spezifische Configuration**
```typescript
// Production: 10% sampling für Performance
tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0

// Development: Sentry komplett deaktiviert
enabled: IS_PRODUCTION
```

### 2. **Sample Rates optimiert**
- **Client:** 10% Traces, 1% Session Replays in Production
- **Server:** 10% Traces in Production  
- **Edge:** 5% Traces (minimal für Performance)
- **Errors:** 100% Capture (replaysOnErrorSampleRate)

### 3. **Performance Monitoring**
```typescript
// Client: Browser Tracing + INP Metrics
Sentry.browserTracingIntegration({
  enableInp: true, // Interaction to Next Paint
})

// Server: Prisma + Extra Error Data
Sentry.prismaIntegration()
Sentry.extraErrorDataIntegration({ depth: 10 })
```

### 4. **Noise Filtering**
```typescript
ignoreErrors: [
  'chrome-extension://', // Browser Extensions
  'NetworkError',        // Flaky Network
  'ENOENT',             // File not found (Expected)
]
```

### 5. **Source Maps**
```typescript
// next.config.ts
sentry: {
  hideSourceMaps: true,        // Protect source code
  disableServerWebpackPlugin: !isProd,
  disableClientWebpackPlugin: !isProd,
}
```

### 6. **Rich Context**
```typescript
beforeSend(event) {
  event.contexts = {
    runtime: {
      name: 'Node.js',
      version: process.version,
    }
  };
}
```

### 7. **Error Levels**
```typescript
// Global Error Boundary
Sentry.captureException(error, {
  level: 'fatal',
  tags: { errorBoundary: 'global' }
})
```

## 📊 Quota Management

### Production Settings
- ✅ 10% Performance Traces (statt 100%)
- ✅ 1% Session Replays (statt 10%)  
- ✅ 100% Errors (always capture)
- ✅ Development komplett disabled

**Erwartete Reduktion:** ~90% weniger Events = niedrigere Kosten

## 🔧 Environment Variables

```bash
# .env.local
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_auth_token  # Für Source Maps Upload

# Optional: Für besseres Environment Tracking
NEXT_PUBLIC_VERCEL_ENV=production
```

## 🚀 Vercel Integration

### Build Environment Variables
```bash
SENTRY_AUTH_TOKEN=sntrys_your_token
SENTRY_ORG=your-org
SENTRY_PROJECT=httpjpg
```

### Source Maps Upload
Source Maps werden automatisch bei jedem Build hochgeladen wenn:
- `NODE_ENV=production`
- `SENTRY_AUTH_TOKEN` gesetzt ist

## 📈 Monitoring Empfehlungen

### Wichtige Metriken
1. **Error Rate:** < 1% aller Requests
2. **Performance:** P95 < 2s Ladezeit
3. **Session Replay:** Kritische Bugs analysieren
4. **INP Metric:** Core Web Vital für UX

### Alerts einrichten
- Error Spikes (> 10 Errors/min)
- Performance Degradation (P95 > 3s)
- Fatal Errors (Global Error Boundary)

## 🔍 Debugging

### Development
```bash
# Sentry Events werden geloggt aber nicht gesendet
pnpm dev
# Console: "Sentry event (not sent in dev): ..."
```

### Production Testing
```bash
# Temporär in client config:
enabled: true,
debug: true,
```

## 🎯 Integration mit Storyblok

Storyblok-spezifische Errors werden gefiltert:
```typescript
ignoreErrors: [
  'Error fetching story',    // Handled gracefully
  'Error fetching stories',  // Handled gracefully
]
```

Aber kritische Fehler werden captured:
- Story nicht gefunden (404)
- API Rate Limits
- Authentifizierungs-Fehler

## ✨ Vorteile

### Vorher
❌ 100% aller Events tracked → hohe Kosten
❌ Development Events → noise
❌ Keine Source Maps → schwer zu debuggen
❌ Browser Extensions → false positives

### Nachher  
✅ 10% Performance Traces → 90% Kostenersparnis
✅ Development disabled → kein noise
✅ Source Maps Upload → präzises debugging
✅ Noise gefiltert → nur echte Fehler
✅ Rich Context → schnellere Lösung
