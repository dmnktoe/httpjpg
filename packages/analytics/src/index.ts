// Provider-agnostic domain events — the surface app code should use.
// Each event fans out to every configured provider. Provider-specific
// primitives live behind the "./google" and "./umami" subpath exports.
export * from "./events";
