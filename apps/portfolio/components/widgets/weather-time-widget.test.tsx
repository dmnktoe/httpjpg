import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({
  current: { NEXT_PUBLIC_WEATHER_TIMEZONE: "Europe/Berlin" } as {
    NEXT_PUBLIC_WEATHER_TIMEZONE?: string;
  },
}));

vi.mock("@httpjpg/env", () => ({
  get env() {
    return envMock.current;
  },
}));

import { WeatherTime } from "./weather-time-widget";

// A visitor five hours behind Berlin: any leak of the browser's own zone renders 18:58:40
// instead of the 00:58:40 the widget owes its owner.
const VISITOR_TIMEZONE = "America/New_York";
const ORIGINAL_TZ = process.env.TZ;

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function renderWithTimezone(timezone: string | undefined) {
  envMock.current = { NEXT_PUBLIC_WEATHER_TIMEZONE: timezone };
  vi.resetModules();
  const { WeatherTime: Widget } = await import("./weather-time-widget");
  render(<Widget />);
}

describe("WeatherTime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMock.current = { NEXT_PUBLIC_WEATHER_TIMEZONE: "Europe/Berlin" };
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    process.env.TZ = ORIGINAL_TZ;
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("renders a ticking clock, UTC offset, and the weather condition", async () => {
    mockFetch({ temperature: 18.4, code: 2, emoji: "⛅", condition: "partly cloudy" });
    render(<WeatherTime />);

    await screen.findByText(/^\d{2}:\d{2}:\d{2}$/);
    expect(screen.getByText(/^UTC[+-]\d+$/)).toBeInTheDocument();

    expect(await screen.findByText("⛅")).toBeInTheDocument();
    expect(screen.getByText("partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("18°")).toBeInTheDocument();
  });

  it("still renders the clock when the weather request fails", async () => {
    mockFetch({}, false);
    render(<WeatherTime />);

    await waitFor(() => expect(screen.queryByText(/^\d{2}:\d{2}:\d{2}$/)).toBeInTheDocument());
    expect(screen.queryByText("⛅")).not.toBeInTheDocument();
  });

  it("shows Berlin time to a visitor in another timezone", async () => {
    process.env.TZ = VISITOR_TIMEZONE;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-08-08T22:58:40Z"));
    mockFetch({}, false);

    await renderWithTimezone("Europe/Berlin");

    expect(screen.getByText("00:58:40")).toBeInTheDocument();
    expect(screen.getByText("UTC+2")).toBeInTheDocument();
  });

  it.each([
    ["unset", undefined],
    ["empty", ""],
    ["unknown", "Not/AZone"],
  ])("falls back to Berlin when the configured timezone is %s", async (_label, timezone) => {
    process.env.TZ = VISITOR_TIMEZONE;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-08-08T22:58:40Z"));
    mockFetch({}, false);

    await renderWithTimezone(timezone);

    expect(screen.getByText("00:58:40")).toBeInTheDocument();
    expect(screen.getByText("UTC+2")).toBeInTheDocument();
  });
});
