import { headers } from "next/headers";

import { STORYBLOK_EDITOR_HEADER } from "./storyblok-editor";

export async function isStoryblokEditor(): Promise<boolean> {
  const reqHeaders = await headers();
  return reqHeaders.get(STORYBLOK_EDITOR_HEADER) === "1";
}
