"use client";

import { useAudioPlayer } from "./audio-player-context";
import { MiniPlayer } from "./mini-player";

/**
 * Drops the page-wide player into the header, right behind the search trigger.
 * Renders nothing until something is loaded, so the nav copy stays untouched
 * for visitors who never press play.
 */
export function MiniPlayerSlot() {
  const player = useAudioPlayer();

  if (!player?.track) {
    return null;
  }

  return (
    <>
      {" • "}
      <MiniPlayer
        title={player.track.title}
        artist={player.track.artist}
        artwork={player.track.artwork}
        isPlaying={player.isPlaying}
        hasNext={player.hasNext}
        hasPrevious={player.hasPrevious}
        onToggle={player.toggle}
        onNext={player.next}
        onPrevious={player.previous}
      />
    </>
  );
}
