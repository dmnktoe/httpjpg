import type { Config } from "./types";

export const config = {
  appName: "㋡httpjpg.com",
  // Frontend
  ui: {
    // the themes that should be available in the app
    enabledThemes: ["light", "dark"],
    // the default theme
    defaultTheme: "light",
  },
} as const satisfies Config;

export type { Config };
