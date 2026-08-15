import { describe, expect, it } from "vitest";

import {
  estimateSteps,
  formatDistanceKm,
  isSteppableType,
  startOfLocalDayUnix,
  summarizeActivities,
} from "./strava";

describe("formatDistanceKm", () => {
  it("keeps one decimal under 10 km", () => {
    expect(formatDistanceKm(5200)).toBe("5.2 km");
  });

  it("rounds whole kilometres from 10 up", () => {
    expect(formatDistanceKm(12400)).toBe("12 km");
  });
});

describe("estimateSteps", () => {
  it("converts metres with a walking cadence", () => {
    expect(estimateSteps(1000)).toBe(1312);
  });
});

describe("isSteppableType", () => {
  it("accepts run / walk / hike variants", () => {
    expect(isSteppableType("Run")).toBe(true);
    expect(isSteppableType("Trail Run")).toBe(true);
    expect(isSteppableType("Ride")).toBe(false);
  });
});

describe("startOfLocalDayUnix", () => {
  it("lands on midnight of the given local day", () => {
    const noon = new Date(2026, 5, 15, 12, 0, 0);
    const start = new Date(startOfLocalDayUnix(noon) * 1000);
    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(15);
  });
});

describe("summarizeActivities", () => {
  it("sums today's distance and picks the dominant type", () => {
    const after = startOfLocalDayUnix(new Date(2026, 5, 15));
    const todayMorning = new Date(2026, 5, 15, 8, 0, 0).toISOString();
    const yesterday = new Date(2026, 5, 14, 8, 0, 0).toISOString();

    const summary = summarizeActivities(
      [
        {
          id: 1,
          name: "Morning run",
          type: "Run",
          distance: 5000,
          moving_time: 1800,
          start_date: todayMorning,
        },
        {
          id: 2,
          name: "Commute",
          type: "Ride",
          distance: 8000,
          moving_time: 1200,
          start_date: todayMorning,
        },
        {
          id: 3,
          name: "Old ride",
          type: "Ride",
          distance: 40000,
          moving_time: 5000,
          start_date: yesterday,
        },
      ],
      "https://www.strava.com/athletes/1",
      after,
    );

    expect(summary.todayCount).toBe(2);
    expect(summary.todayDistanceMeters).toBe(13000);
    expect(summary.primaryType).toBe("Ride");
    expect(summary.latest?.id).toBe(1);
  });
});
