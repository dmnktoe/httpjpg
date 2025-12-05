const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./apps/web",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  globals: {
    "process.env.SKIP_ENV_VALIDATION": "true",
  },
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
      "<rootDir>/__mocks__/fileMock.js",

    // Handle module aliases
    "^@/(.*)$": "<rootDir>/apps/web/$1",
    "^@httpjpg/ui$": "<rootDir>/packages/ui/src",
    "^@httpjpg/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
    "^styled-system/(.*)$": "<rootDir>/packages/ui/styled-system/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/apps/web/tests/e2e/", // Ignore Playwright E2E tests
  ],
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  collectCoverageFrom: [
    "packages/*/src/**/*.{js,jsx,ts,tsx}",
    "apps/web/app/**/*.{js,jsx,ts,tsx}",
    "apps/web/components/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/styled-system/**",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
