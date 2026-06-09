import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_WEATHER_TIMEZONE: "Europe/Berlin" },
}));

import { WeatherTime } from "./weather-time-widget";

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("WeatherTime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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
});
