vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_STORYBLOK_TOKEN: "token" } }));

const { storyblokInit, apiPlugin } = vi.hoisted(() => ({
  storyblokInit: vi.fn(),
  apiPlugin: { name: "api-plugin" },
}));

vi.mock("@httpjpg/storyblok-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@httpjpg/storyblok-ui")>();
  return { ...actual, storyblokInit, apiPlugin };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("storyblok registry", () => {
  it("initialises the SDK once per module instance", async () => {
    await import("./storyblok");
    await import("./storyblok");

    expect(storyblokInit).toHaveBeenCalledOnce();
  });

  it("registers every blok component under its CMS name", async () => {
    await import("./storyblok");

    const { components } = storyblokInit.mock.calls[0][0];
    expect(Object.keys(components)).toEqual(
      expect.arrayContaining([
        "accordion",
        "grid",
        "grid_item",
        "page",
        "richtext",
        "work",
        "work_card",
        "work_list",
      ]),
    );
    for (const component of Object.values(components)) {
      // Plain components are functions; memo/forwardRef wrappers are objects.
      expect(["function", "object"]).toContain(typeof component);
      expect(component).toBeTruthy();
    }
  });

  it("passes the access token, the api plugin and the eu region", async () => {
    await import("./storyblok");

    expect(storyblokInit).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token",
        use: [apiPlugin],
        apiOptions: { region: "eu" },
        bridge: true,
      }),
    );
  });

  it("enables the fallback component only in development", async () => {
    const previous = process.env.NODE_ENV;

    vi.stubEnv("NODE_ENV", "production");
    await import("./storyblok");
    expect(storyblokInit.mock.calls[0][0].enableFallbackComponent).toBe(false);
    expect(storyblokInit.mock.calls[0][0].customFallbackComponent).toBeUndefined();

    vi.resetModules();
    storyblokInit.mockClear();

    vi.stubEnv("NODE_ENV", "development");
    await import("./storyblok");
    expect(storyblokInit.mock.calls[0][0].enableFallbackComponent).toBe(true);
    expect(storyblokInit.mock.calls[0][0].customFallbackComponent).toBeTruthy();

    vi.stubEnv("NODE_ENV", previous ?? "test");
  });
});
