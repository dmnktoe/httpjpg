# @httpjpg/consent

ASCII-style cookie consent banner for GDPR compliance.

## Features

- 🎨 Retro ASCII design with c15t aesthetics
- 🍪 GDPR-compliant cookie management
- 🎚️ Granular consent controls
- 🔒 Respects legitimate interest for monitoring
- ⚡ Lightweight and performant

## Usage

```tsx
import { CookieBanner } from "@httpjpg/consent";

export default function App() {
  return (
    <>
      <CookieBanner 
        onAcceptAll={(consent) => {
          // Initialize analytics
          console.log("Consent accepted:", consent);
        }}
        onRejectAll={() => {
          // Disable optional tracking
          console.log("Consent rejected");
        }}
      />
    </>
  );
}
```

## Consent Categories

- **Analytics**: Google Analytics (optional, requires consent)
- **Monitoring**: Sentry, Datadog (required, legitimate interest)
- **Preferences**: User settings (required, technical necessity)
