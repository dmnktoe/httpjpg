export interface AppConfig {
  appName: string;
}

export const config = {
  appName: "㋡httpjpg.com",
} as const satisfies AppConfig;
