// @vitest-environment node
vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: vi.fn(),
}));

import { getStoryblokApi } from "@httpjpg/storyblok-api";

import { CONFIG_FIELDS, requireConfigField, resolveConfigField } from "./config-field";
import { API_ERROR } from "./errors";

const { getStory } = vi.hoisted(() => ({ getStory: vi.fn() }));

const isUsername = (value: unknown): value is string =>
  typeof value === "string" && /^\w+$/.test(value);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStoryblokApi).mockReturnValue({ getStory } as never);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("resolveConfigField", () => {
  it("returns the field when it is present and valid", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "dmnk" } });

    await expect(
      resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, false),
    ).resolves.toEqual({ ok: true, value: "dmnk" });
    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: false });
  });

  it("reads through draft mode", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "dmnk" } });

    await resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, true);

    expect(getStoryblokApi).toHaveBeenCalledWith({ draftMode: true });
  });

  it("returns missing when the field is absent", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    await expect(
      resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, false),
    ).resolves.toEqual({ ok: false, reason: "missing" });
  });

  it("returns missing and warns when the value fails the guard", async () => {
    getStory.mockResolvedValueOnce({ content: { letterboxd_username: "bad name" } });

    await expect(
      resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, false),
    ).resolves.toEqual({ ok: false, reason: "missing" });
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns unavailable when the story is missing", async () => {
    getStory.mockResolvedValueOnce(null);

    await expect(
      resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, false),
    ).resolves.toEqual({ ok: false, reason: "unavailable" });
  });

  it("returns unavailable when Storyblok throws", async () => {
    getStory.mockRejectedValueOnce(new Error("down"));

    await expect(
      resolveConfigField(CONFIG_FIELDS.letterboxdUsername, isUsername, false),
    ).resolves.toEqual({ ok: false, reason: "unavailable" });
  });
});

describe("requireConfigField", () => {
  it("returns the value when configured", async () => {
    getStory.mockResolvedValueOnce({ content: { discord_user_id: "123" } });

    await expect(
      requireConfigField(CONFIG_FIELDS.discordUserId, isUsername, false),
    ).resolves.toEqual({ ok: true, value: "123" });
  });

  it("returns 501 when the field is missing", async () => {
    getStory.mockResolvedValueOnce({ content: {} });

    const result = await requireConfigField(CONFIG_FIELDS.discordUserId, isUsername, false);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.response.status).toBe(501);
    await expect(result.response.json()).resolves.toEqual({
      error: API_ERROR.notConfigured,
      message: "Set discord_user_id in the Storyblok config story",
    });
  });

  it("returns 503 when the config story cannot be loaded", async () => {
    getStory.mockResolvedValueOnce(null);

    const result = await requireConfigField(CONFIG_FIELDS.discordUserId, isUsername, false);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.response.status).toBe(503);
    await expect(result.response.json()).resolves.toMatchObject({
      error: API_ERROR.configUnavailable,
    });
  });
});
