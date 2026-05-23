import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext, waitForPageReady } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

const SNAPSHOT_DIR = resolve(process.cwd(), "__image_snapshots__");
mkdirSync(SNAPSHOT_DIR, { recursive: true });

expect.extend({ toMatchImageSnapshot });

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async preVisit(page) {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.tags?.includes("no-visual")) {
      return;
    }

    await waitForPageReady(page);
    await page.evaluate(() => document.fonts.ready);

    const screenshot = await page.locator("#storybook-root").screenshot();
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotsDir: SNAPSHOT_DIR,
      customSnapshotIdentifier: context.id,
      failureThreshold: 0.01,
      failureThresholdType: "percent",
    });
  },
};

export default config;
