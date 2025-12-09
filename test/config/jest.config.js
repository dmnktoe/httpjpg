// Set SKIP_ENV_VALIDATION before any imports
process.env.SKIP_ENV_VALIDATION = "true";

const path = require("node:path");
const nextJest = require("next/jest");

// Resolve to workspace root
const workspaceRoot = path.resolve(__dirname, "../..");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: path.join(workspaceRoot, "apps/web"),
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  rootDir: workspaceRoot,
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/test/config/jest.setup.js"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/test/mocks/styleMock.js",

    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
      "<rootDir>/test/mocks/fileMock.js",

    // Handle module aliases
    "^@/(.*)$": "<rootDir>/apps/web/$1",
    "^@httpjpg/ui$": "<rootDir>/packages/ui/src",
    "^@httpjpg/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
    "^styled-system/(.*)$": "<rootDir>/packages/ui/styled-system/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "node_modules",
    "\\.next",
    "apps/web/tests/e2e", // Ignore Playwright E2E tests
  ],
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  collectCoverageFrom: [
    // All packages
    "packages/*/src/**/*.{js,jsx,ts,tsx,mjs}",
    // Web app
    "apps/web/app/**/*.{js,jsx,ts,tsx}",
    "apps/web/components/**/*.{js,jsx,ts,tsx}",
    "apps/web/lib/**/*.{js,jsx,ts,tsx}",
    // Exclusions
    "!**/*.d.ts",
    "!**/*.test.{js,jsx,ts,tsx}",
    "!**/*.spec.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/styled-system/**",
    "!**/scripts/**",
    "!**/index.ts", // Barrel exports
    "!**/types.ts", // Type definitions only
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
