// @vitest-environment node
import { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from "./route";

const handlers = { GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS };

describe("unknown /api paths", () => {
  it.each(Object.entries(handlers))("answers %s with a JSON 404", async (_method, handler) => {
    const response = handler();

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(await response.json()).toEqual({ error: "not_found" });
  });
});
