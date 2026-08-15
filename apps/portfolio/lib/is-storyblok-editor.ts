import { headers } from "next/headers";

import { STORYBLOK_EDITOR_HEADER } from "./storyblok-editor";

/** True when the request is rendered inside the Storyblok Visual Editor iframe. */
export async function isStoryblokEditor(): Promise<boolean> {
  const reqHeaders = await headers();
  return reqHeaders.get(STORYBLOK_EDITOR_HEADER) === "1";
}
