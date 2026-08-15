import { describe, expect, it } from "vitest";

import {
  matchWorkTag,
  resolveTagBrowseIntent,
  WORK_LIST_PATH,
  workTagFilterHref,
} from "./tag-intent";

describe("matchWorkTag", () => {
  it("matches a label case-insensitively", () => {
    expect(matchWorkTag("typescript")?.value).toBe("typescript");
    expect(matchWorkTag("TypeScript")?.label).toBe("TypeScript");
  });

  it("matches hyphenated values typed with spaces", () => {
    expect(matchWorkTag("next js")?.value).toBe("next-js");
  });
});

describe("resolveTagBrowseIntent", () => {
  it("returns a filtered work-list href for browse phrasing", () => {
    expect(resolveTagBrowseIntent("show me TypeScript projects")).toEqual({
      tag: expect.objectContaining({ value: "typescript", label: "TypeScript" }),
      href: `${WORK_LIST_PATH}?tag=TypeScript`,
      title: "TypeScript work",
    });
  });

  it("treats a bare tag as a browse intent", () => {
    expect(resolveTagBrowseIntent("React")?.href).toBe(`${WORK_LIST_PATH}?tag=React`);
  });

  it("stays out of the way when the tag is only mentioned in passing", () => {
    expect(resolveTagBrowseIntent("who designed the TypeScript logo")).toBeNull();
  });
});

describe("workTagFilterHref", () => {
  it("encodes the display label into the query string", () => {
    expect(
      workTagFilterHref({ value: "full-stack", label: "Full Stack", group: "discipline" }),
    ).toBe("/work?tag=Full+Stack");
  });
});
