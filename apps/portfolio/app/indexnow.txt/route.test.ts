// @vitest-environment node
const { env } = vi.hoisted(() => ({ env: { INDEXNOW_KEY: undefined as string | undefined } }));

vi.mock("@httpjpg/env", () => ({ env }));

import { GET } from "./route";

describe("GET /indexnow.txt", () => {
  it("404s when no key is configured", () => {
    env.INDEXNOW_KEY = undefined;

    expect(GET().status).toBe(404);
  });

  it("serves the key as plain text", async () => {
    env.INDEXNOW_KEY = "abcdef123456";

    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/text\/plain/);
    expect(await response.text()).toBe("abcdef123456");
  });
});
