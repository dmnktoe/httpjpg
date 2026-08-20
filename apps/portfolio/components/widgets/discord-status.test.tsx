import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DiscordStatus } from "./discord-status";

afterEach(cleanup);

describe("DiscordStatus", () => {
  it("holds a loading line until the first response lands", () => {
    render(<DiscordStatus presence={null} loaded={false} />);

    // Presence starts unknown, so the line must not claim "offline" first.
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    expect(screen.queryByText("offline")).not.toBeInTheDocument();
  });

  it("falls back to offline when the endpoint returned nothing", () => {
    render(<DiscordStatus presence={null} loaded />);

    expect(screen.getByText("offline")).toBeInTheDocument();
  });

  it("shows the current activity with its playtime", () => {
    render(
      <DiscordStatus
        presence={{
          status: "dnd",
          activity: "Bloodborne",
          activityDetails: { playtime: "2h 14m", icon: "https://cdn.test/icon.png" },
        }}
        loaded
      />,
    );

    expect(screen.getByText("dnd")).toBeInTheDocument();
    expect(screen.getByText("Bloodborne")).toBeInTheDocument();
    expect(screen.getByText("2h 14m")).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://cdn.test/icon.png");
  });

  it("omits the activity fields when nothing is being played", () => {
    render(<DiscordStatus presence={{ status: "idle", activity: null }} loaded />);

    expect(screen.getByText("idle")).toBeInTheDocument();
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });
});
