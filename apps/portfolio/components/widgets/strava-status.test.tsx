import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StravaStatusPayload } from "@/lib/integrations/strava";

import { StravaStatus } from "./strava-status";

const todayRun: StravaStatusPayload = {
  todayDistanceMeters: 5000,
  todayMovingTimeSeconds: 1800,
  todayCount: 1,
  primaryType: "Run",
  profileUrl: "https://www.strava.com/athletes/1",
  latest: {
    id: 9,
    name: "Morning",
    type: "Run",
    distanceMeters: 5000,
    movingTimeSeconds: 1800,
    startDate: "2026-06-15T08:00:00Z",
    url: "https://www.strava.com/activities/9",
  },
};

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("StravaStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows loading then collapses when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<StravaStatus />);
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders today's estimated steps for a run", async () => {
    mockFetch(todayRun);
    render(<StravaStatus />);

    expect(await screen.findByText(/6,560 steps · 5\.0 km/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", todayRun.latest?.url);
  });

  it("falls back to the latest activity on a rest day", async () => {
    mockFetch({
      ...todayRun,
      todayCount: 0,
      todayDistanceMeters: 0,
      primaryType: "Ride",
      latest: {
        ...todayRun.latest!,
        type: "Ride",
        distanceMeters: 32000,
        url: "https://www.strava.com/activities/8",
      },
    });
    render(<StravaStatus />);

    expect(await screen.findByText(/last · Ride · 32 km/)).toBeInTheDocument();
  });
});
