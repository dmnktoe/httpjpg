import { argosScreenshot } from "@argos-ci/playwright";
import { test } from "@playwright/test";

import { MOBILE_TAG, listVisualStories, prepareStory } from "./lib";

const stories = listVisualStories();

if (stories.length === 0) {
  throw new Error("Storybook build contains no stories — refusing to report a green visual run.");
}

for (const story of stories) {
  test(`${story.title} › ${story.name}`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile" && !story.tags.includes(MOBILE_TAG),
      `not tagged "${MOBILE_TAG}"`,
    );

    await prepareStory(page, story.id);

    const name = testInfo.project.name === "mobile" ? `${story.id}-mobile` : story.id;
    await argosScreenshot(page, name);
  });
}
