export interface AppConfig {
  appName: string;
  repositoryUrl: string;
}

export const config = {
  appName: "㋡httpjpg.com",
  repositoryUrl: "https://github.com/dmnktoe/httpjpg",
} as const satisfies AppConfig;
