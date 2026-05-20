export interface AppConfig {
  appName: string;
  ui: {
    enabledThemes: Array<"light" | "dark">;
    defaultTheme: "light" | "dark";
  };
}

export const config = {
  appName: "㋡httpjpg.com",
  ui: {
    enabledThemes: ["light", "dark"],
    defaultTheme: "light",
  },
} as const satisfies AppConfig;
