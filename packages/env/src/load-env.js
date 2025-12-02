// Load root .env.local file in monorepo
// This file is only imported in Node.js runtime, never in Edge or client
try {
  const dotenv = require("dotenv");
  const path = require("path");
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env.local") });
} catch {
  // Silently fail if not in Node.js environment
}
