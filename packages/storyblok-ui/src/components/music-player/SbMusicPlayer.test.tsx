import { render } from "@testing-library/react";

import { SbMusicPlayer } from "./SbMusicPlayer";

describe("SbMusicPlayer", () => {
  it("returns null without a src", () => {
    const { container } = render(
      <SbMusicPlayer blok={{ _uid: "1", component: "music_player" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an mp3 player when a src is set", () => {
    const { container } = render(
      <SbMusicPlayer
        blok={
          {
            _uid: "2",
            component: "music_player",
            source: "mp3",
            src: "https://a.storyblok.com/f/1/song.mp3",
            title: "Track",
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a consent placeholder for spotify without consent", () => {
    const { container } = render(
      <SbMusicPlayer
        blok={
          {
            _uid: "3",
            component: "music_player",
            source: "spotify",
            src: "https://open.spotify.com/track/abc",
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });
});
