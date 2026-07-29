export interface AppConfig {
  appName: string;
  ui: {
    enabledThemes: Array<"light" | "dark">;
    defaultTheme: "light" | "dark";
  };
  ios: {
    bundleId: string;
  };
}

export const config = {
  appName: "㋡httpjpg.com",
  ui: {
    enabledThemes: ["light", "dark"],
    defaultTheme: "light",
  },
  ios: {
    bundleId: "com.httpjpg.portfolio",
  },
} as const satisfies AppConfig;
