import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

export const STORYBOOK_STATIC_PORT = Number(process.env.STORYBOOK_STATIC_PORT) || 6007;
export const STORYBOOK_BASE_URL = `http://127.0.0.1:${STORYBOOK_STATIC_PORT}`;

export const SKIP_TAG = "skip-visual";
export const MOBILE_TAG = "visual-mobile";

export interface VisualStory {
  id: string;
  title: string;
  name: string;
  tags: string[];
}

export function listVisualStories(): VisualStory[] {
  const indexPath = path.resolve(currentDir(), "../../storybook-static/index.json");

  let raw: string;
  try {
    raw = readFileSync(indexPath, "utf8");
  } catch {
    throw new Error(
      `No Storybook build at ${indexPath}. Run \`pnpm --filter @httpjpg/storybook build\` first.`,
    );
  }

  const index = JSON.parse(raw) as StoryIndex;

  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      tags: entry.tags ?? [],
    }))
    .filter((story) => !story.tags.includes(SKIP_TAG))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function prepareStory(page: Page, storyId: string): Promise<void> {
  await stubExternalRequests(page);
  await freezeNondeterminism(page);

  const params = new URLSearchParams({ id: storyId, viewMode: "story" });
  await page.goto(`${STORYBOOK_BASE_URL}/iframe.html?${params}`, { waitUntil: "load" });

  await page.waitForSelector(
    "body.sb-show-main, body.sb-show-errordisplay, body.sb-show-nopreview",
    { state: "attached" },
  );

  if ((await page.locator("body.sb-show-main").count()) === 0) {
    const message = await page
      .locator("#error-message")
      .innerText()
      .catch(() => "no preview");
    throw new Error(`Storybook failed to render "${storyId}": ${message}`);
  }

  await page.evaluate(async (imageTimeout) => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo(0, 0);

    await document.fonts.ready;

    const settle = (image: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });

    await Promise.race([
      Promise.all(Array.from(document.images).map(settle)),
      new Promise((resolve) => setTimeout(resolve, imageTimeout)),
    ]);
  }, IMAGE_SETTLE_TIMEOUT);
}

async function stubExternalRequests(page: Page): Promise<void> {
  await page.route("**/*", (route) => {
    const url = route.request().url();

    if (url.startsWith(STORYBOOK_BASE_URL)) {
      return route.continue();
    }

    if (route.request().resourceType() === "image") {
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: PLACEHOLDER_IMAGE,
      });
    }

    return route.abort();
  });
}

async function freezeNondeterminism(page: Page): Promise<void> {
  await page.addInitScript(
    ({ now, seed }) => {
      const OriginalDate = Date;
      const FrozenDate = new Proxy(OriginalDate, {
        construct(target, args, newTarget) {
          return Reflect.construct(target, args.length === 0 ? [now] : args, newTarget);
        },
      });
      FrozenDate.now = () => now;
      globalThis.Date = FrozenDate;

      let state = seed;
      Math.random = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    { now: FROZEN_NOW, seed: RANDOM_SEED },
  );
}

const FROZEN_NOW = Date.parse("2026-01-01T12:00:00.000Z");
const RANDOM_SEED = 0x1a2b3c4d;
const IMAGE_SETTLE_TIMEOUT = 5000;

const PLACEHOLDER_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#d4d4d4"/><path d="M0 0l1200 800M1200 0L0 800" stroke="#a3a3a3" stroke-width="6"/></svg>`;

function currentDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

interface StoryIndex {
  v: number;
  entries: Record<string, StoryIndexEntry>;
}

interface StoryIndexEntry {
  id: string;
  name: string;
  title: string;
  type: "story" | "docs";
  tags?: string[];
}
