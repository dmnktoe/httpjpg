# @httpjpg/security

Security middleware and utilities powered by Arcjet.

## Features

- 🛡️ Rate limiting for API routes
- 🤖 Bot detection and protection
- 📧 Email validation
- 🔒 Attack protection (SQL injection, XSS)

## Usage

### In Next.js Middleware

```typescript
import { withArcjet } from "@httpjpg/security/middleware";

export default withArcjet();
```

### In API Routes

```typescript
import { protectRoute } from "@httpjpg/security";

export default protectRoute(async (req) => {
  // Your API logic
});
```
