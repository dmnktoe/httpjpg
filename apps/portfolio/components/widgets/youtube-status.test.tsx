import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { YoutubeChannel, YoutubeVideo } from "@/lib/integrations/youtube";

const { trackOutboundClick } = vi.hoisted(() => ({ trackOutboundClick: vi.fn() }));
vi.mock("@httpjpg/analytics", () => ({ trackOutboundClick }));

import { YoutubeStatus } from "./youtube-status";

const channel: YoutubeChannel = {
  id: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  title: "httpjpg",
  avatar: "https://example.com/avatar.jpg",
  url: "https://www.youtube.com/@httpjpg",
  subscriberCount: 1230,
};

const video: YoutubeVideo = {
  id: "dQw4w9WgXcQ",
  title: "Studio tour",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnail: null,
  publishedAt: null,
};

afterEach(cleanup);

describe("YoutubeStatus", () => {
  it("holds a loading label, then collapses without an upload", () => {
    const { rerender, container } = render(
      <YoutubeStatus channel={null} video={null} loaded={false} />,
    );
    expect(screen.getByText("loading ...")).toBeInTheDocument();

    rerender(<YoutubeStatus channel={channel} video={null} loaded />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the latest upload with the channel avatar and subscriber count", () => {
    render(<YoutubeStatus channel={channel} video={video} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", video.url);
    expect(document.querySelector(`img[src="${channel.avatar}"]`)).toBeInTheDocument();
    expect(screen.getByLabelText("1230 subscribers")).toHaveTextContent("(1.2K)");
    expect(screen.getByText("Studio tour")).toBeInTheDocument();

    screen.getByRole("link").click();
    expect(trackOutboundClick).toHaveBeenCalledWith({
      destination: "youtube",
      href: video.url,
      label: "Studio tour",
    });
  });

  it("leaves out a hidden subscriber count and a missing avatar", () => {
    render(
      <YoutubeStatus
        channel={{ ...channel, avatar: null, subscriberCount: null }}
        video={video}
        loaded
      />,
    );

    expect(screen.queryByLabelText(/subscribers/)).not.toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });
});
