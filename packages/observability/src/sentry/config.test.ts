// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({
  SENTRY_DSN: "https://server@sentry.io/1",
  NEXT_PUBLIC_SENTRY_DSN: "https://client@sentry.io/2",
  SENTRY_ENABLE_IN_DEV: "true",
  NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: "",
  NODE_ENV: "production",
  NEXT_PUBLIC_APP_VERSION: undefined as string | undefined,
}));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

import { getSentryConfig } from "./config";

describe("getSentryConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GITHUB_SHA;
    delete process.env.npm_package_version;
    mockEnv.NEXT_PUBLIC_APP_VERSION = undefined;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("prefers NEXT_PUBLIC_APP_VERSION over GITHUB_SHA and npm_package_version", () => {
    mockEnv.NEXT_PUBLIC_APP_VERSION = "v1.2.3";
    process.env.GITHUB_SHA = "abc123";
    process.env.npm_package_version = "0.0.0";

    const config = getSentryConfig("server");

    expect(config.release).toBe("v1.2.3");
  });

  it("resolves release from GITHUB_SHA when available", () => {
    process.env.GITHUB_SHA = "abc123";
    process.env.npm_package_version = "1.0.0";

    const config = getSentryConfig("server");

    expect(config.release).toBe("abc123");
  });

  it("falls back to npm_package_version when GITHUB_SHA is absent", () => {
    process.env.npm_package_version = "2.5.0";

    const config = getSentryConfig("server");

    expect(config.release).toBe("2.5.0");
  });

  it("returns undefined release when neither is set", () => {
    const config = getSentryConfig("server");

    expect(config.release).toBeUndefined();
  });

  it("treats empty GITHUB_SHA as absent and falls back", () => {
    process.env.GITHUB_SHA = "";
    process.env.npm_package_version = "3.0.0";

    const config = getSentryConfig("server");

    expect(config.release).toBe("3.0.0");
  });

  it("treats whitespace-only GITHUB_SHA as absent", () => {
    process.env.GITHUB_SHA = "  ";

    const config = getSentryConfig("server");

    expect(config.release).toBeUndefined();
  });

  it("uses server DSN for server scope", () => {
    const config = getSentryConfig("server");

    expect(config.dsn).toBe("https://server@sentry.io/1");
  });

  it("uses client DSN for client scope", () => {
    const config = getSentryConfig("client");

    expect(config.dsn).toBe("https://client@sentry.io/2");
  });

  it("is enabled in production with DSN present", () => {
    const config = getSentryConfig("server");

    expect(config.isEnabled).toBe(true);
    expect(config.isProduction).toBe(true);
  });

  it("uses client DSN for edge scope", () => {
    const config = getSentryConfig("edge");

    expect(config.dsn).toBe("https://client@sentry.io/2");
  });
});
