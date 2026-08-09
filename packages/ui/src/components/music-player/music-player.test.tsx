import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";

import { ASCII_DIVIDER_MUSIC } from "../ascii-art/banners";
import { AudioPlayerProvider } from "./audio-player-provider";
import { MusicPlayer } from "./music-player";

function iframe() {
  return document.querySelector("iframe") as HTMLIFrameElement | null;
}

describe("MusicPlayer", () => {
  it("renders the mp3 player by default", () => {
    render(<MusicPlayer src="/track.mp3" title="Night Drive" />);

    expect(screen.getByLabelText("Night Drive")).toBeInTheDocument();
    expect(iframe()).toBeNull();
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<MusicPlayer ref={ref} src="/track.mp3" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes the track metadata down to the mp3 player", () => {
    render(<MusicPlayer src="/track.mp3" title="Night Drive" artist="Nova" artwork="/art.jpg" />);

    expect(screen.getByAltText("Night Drive")).toHaveAttribute("src", "/art.jpg");
    expect(screen.getByText("Nova")).toBeInTheDocument();
  });

  it("renders the ascii decoration above and below by default", () => {
    render(<MusicPlayer src="/track.mp3" />);

    expect(screen.getAllByText(ASCII_DIVIDER_MUSIC)).toHaveLength(2);
  });

  it("drops the decoration when it is emptied out", () => {
    render(<MusicPlayer src="/track.mp3" decoration="" />);

    expect(screen.queryByText(ASCII_DIVIDER_MUSIC)).not.toBeInTheDocument();
  });

  it("renders header and footer content", () => {
    render(
      <MusicPlayer
        src="/track.mp3"
        headerContent={<span data-testid="head" />}
        footerContent={<span data-testid="foot" />}
      />,
    );

    expect(screen.getByTestId("head")).toBeInTheDocument();
    expect(screen.getByTestId("foot")).toBeInTheDocument();
  });

  it("keeps a caller-supplied className", () => {
    const { container } = render(<MusicPlayer src="/track.mp3" className="custom" />);

    expect(container.firstElementChild).toHaveClass("custom");
  });

  describe("spotify", () => {
    it("embeds a spotify track at the normal height", () => {
      render(<MusicPlayer source="spotify" src="https://open.spotify.com/track/abc123" />);

      const embed = iframe();
      expect(embed).toHaveAttribute("src", expect.stringContaining("/embed/track/abc123"));
      expect(embed).toHaveAttribute("height", "352");
      expect(embed).toHaveAttribute("title", "Spotify Player");
    });

    it("shrinks the embed for the compact size", () => {
      render(
        <MusicPlayer
          source="spotify"
          src="https://open.spotify.com/track/abc123"
          spotifySize="compact"
        />,
      );

      expect(iframe()).toHaveAttribute("height", "152");
    });

    it("uses the track title as the iframe title", () => {
      render(
        <MusicPlayer
          source="spotify"
          src="https://open.spotify.com/track/abc123"
          title="Night Drive"
        />,
      );

      expect(iframe()).toHaveAttribute("title", "Night Drive");
    });
  });

  describe("with a page-wide player", () => {
    function renderInProvider(ui: React.ReactNode) {
      return render(<AudioPlayerProvider>{ui}</AudioPlayerProvider>);
    }

    beforeEach(() => {
      vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(async () => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("hands the track over instead of opening a second audio element", () => {
      renderInProvider(<MusicPlayer src="/track.mp3" title="Night Drive" artist="Nova" />);

      // The provider's element is the only one — the blok opens none of its own.
      expect(document.querySelectorAll("audio")).toHaveLength(1);
      expect(screen.getByRole("button", { name: "Play" })).toHaveTextContent("▸ PLAY");
      expect(screen.getByText("Nova")).toBeInTheDocument();
    });

    it("starts the shared player from the blok", () => {
      renderInProvider(<MusicPlayer src="/track.mp3" title="Night Drive" />);

      fireEvent.click(screen.getByRole("button", { name: "Play" }));

      expect(document.querySelector("audio")).toHaveAttribute("src", "/track.mp3");
    });

    it("starts on its own when it is set to autoplay", () => {
      const play = vi.spyOn(window.HTMLMediaElement.prototype, "play");
      renderInProvider(<MusicPlayer src="/track.mp3" autoPlay />);

      expect(play).toHaveBeenCalledOnce();
      expect(document.querySelector("audio")).toHaveAttribute("src", "/track.mp3");
    });

    it("leaves the embeds to their own transport", () => {
      renderInProvider(<MusicPlayer source="spotify" src="spotify:track:abc123" />);

      expect(iframe()).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
    });
  });

  describe("soundcloud", () => {
    it("embeds a soundcloud url", () => {
      render(<MusicPlayer source="soundcloud" src="https://soundcloud.com/nova/night-drive" />);

      const embed = iframe();
      expect(embed).toHaveAttribute(
        "src",
        expect.stringContaining(encodeURIComponent("https://soundcloud.com/nova/night-drive")),
      );
      expect(embed).toHaveAttribute("title", "SoundCloud Player");
    });

    it("uses the track title as the iframe title", () => {
      render(
        <MusicPlayer
          source="soundcloud"
          src="https://soundcloud.com/nova/night-drive"
          title="Night Drive"
        />,
      );

      expect(iframe()).toHaveAttribute("title", "Night Drive");
    });
  });
});
