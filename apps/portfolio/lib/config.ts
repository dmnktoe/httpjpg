export interface AppConfig {
  appName: string;
  repositoryUrl: string;
  locale: string;
}

/** Fallbacks for the General tab of the Storyblok config story. */
export const config = {
  appName: "㋡httpjpg.com",
  repositoryUrl: "https://github.com/dmnktoe/httpjpg",
  locale: "de_DE",
} as const satisfies AppConfig;
