export type Config = {
  appName: string;
  ui: {
    enabledThemes: Array<"light" | "dark">;
    defaultTheme: Config["ui"]["enabledThemes"][number];
  };
};
