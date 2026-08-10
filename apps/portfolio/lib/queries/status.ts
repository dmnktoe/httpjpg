import { env } from "@httpjpg/env";
import { getStoryblokApi } from "@httpjpg/storyblok-api";

import { getActivitySources, resolveActivityConfig } from "./activity";
import { getConfig } from "./config";

export const SERVICE_STATES = {
  ok: "ok",
  down: "down",
  off: "off",
} as const;

export type ServiceState = (typeof SERVICE_STATES)[keyof typeof SERVICE_STATES];

export interface ServiceStatus {
  id: string;
  label: string;
  state: ServiceState;
  detail: string;
  probed: boolean;
}

export interface BuildInfo {
  version?: string;
  commitSha?: string;
  buildTime?: string;
  repositoryUrl: string;
}

export interface SiteStatus {
  services: ServiceStatus[];
  checkedAt: string;
}

function service(
  id: string,
  label: string,
  state: ServiceState,
  detail: string,
  probed: boolean,
): ServiceStatus {
  return { id, label, state, detail, probed };
}

async function probeStoryblok(): Promise<ServiceStatus> {
  const started = Date.now();
  try {
    const response = await getStoryblokApi({ draftMode: false }).getStories({
      per_page: 1,
      version: "published",
    });
    const total = response.total ?? response.stories?.length ?? 0;
    if (!response.stories || response.stories.length === 0) {
      return service("storyblok", "Storyblok", SERVICE_STATES.down, "no published stories", true);
    }
    return service(
      "storyblok",
      "Storyblok",
      SERVICE_STATES.ok,
      `${total} published · ${Date.now() - started}ms`,
      true,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return service("storyblok", "Storyblok", SERVICE_STATES.down, message, true);
  }
}

export async function getSiteStatus(): Promise<SiteStatus> {
  const [storyblok, config, sources] = await Promise.all([
    probeStoryblok(),
    getConfig().catch(() => null),
    getActivitySources(),
  ]);

  const activity = resolveActivityConfig(config ?? {});
  const issueFor = (source: string) =>
    sources.issues.find((issue) => issue.source === source)?.message;

  const feed = (
    id: string,
    label: string,
    configured: boolean,
    entries: unknown[],
    issueKey: string,
  ): ServiceStatus => {
    if (!configured) {
      return service(id, label, SERVICE_STATES.off, "not configured", false);
    }
    const issue = issueFor(issueKey);
    if (issue) {
      return service(id, label, SERVICE_STATES.down, issue, true);
    }
    return service(id, label, SERVICE_STATES.ok, `${entries.length} recent`, true);
  };

  const services: ServiceStatus[] = [
    storyblok,
    feed("letterboxd", "Letterboxd", Boolean(activity.letterboxd), sources.films, "letterboxd"),
    feed("discogs", "Discogs", Boolean(activity.discogs), sources.records, "discogs"),
    feed("psn", "PlayStation", activity.hasPsn, sources.trophies, "psn"),
    service(
      "ask",
      "Ask (Groq)",
      env.GROQ_API_KEY ? SERVICE_STATES.ok : SERVICE_STATES.off,
      env.GROQ_API_KEY ? `key present · ${env.GROQ_MODEL}` : "no API key — search still works",
      false,
    ),
    service(
      "spotify",
      "Spotify",
      (config?.spotify_enabled ?? true) ? SERVICE_STATES.ok : SERVICE_STATES.off,
      (config?.spotify_enabled ?? true) ? "enabled in config" : "disabled in config",
      false,
    ),
    service(
      "discord",
      "Discord",
      (config?.discord_enabled ?? true) ? SERVICE_STATES.ok : SERVICE_STATES.off,
      (config?.discord_enabled ?? true) ? "enabled in config" : "disabled in config",
      false,
    ),
    service(
      "sentry",
      "Sentry",
      env.NEXT_PUBLIC_SENTRY_DSN ? SERVICE_STATES.ok : SERVICE_STATES.off,
      env.NEXT_PUBLIC_SENTRY_DSN ? "DSN present" : "no DSN — errors are not reported",
      false,
    ),
  ];

  return { services, checkedAt: new Date().toISOString() };
}

export function getBuildInfo(repositoryUrl: string): BuildInfo {
  return {
    version: env.NEXT_PUBLIC_APP_VERSION,
    commitSha: env.NEXT_PUBLIC_COMMIT_SHA,
    buildTime: env.NEXT_PUBLIC_BUILD_TIME,
    repositoryUrl,
  };
}
