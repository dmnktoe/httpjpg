"use client";

import { createContext, useContext, useEffect } from "react";

/** One playable audio source. `src` is the identity — one queue entry per url. */
export interface AudioTrack {
  src: string;
  title?: string;
  artist?: string;
  artwork?: string;
}

export interface AudioPlayerValue {
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  hasNext: boolean;
  hasPrevious: boolean;
  /** Starts `track` and snapshots the page queue around it. */
  play: (track: AudioTrack) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  /** Adds a track to the page queue; the returned callback takes it out again. */
  registerTrack: (track: AudioTrack) => () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerValue | null>(null);

/**
 * Null outside an `AudioPlayerProvider` — the same seam the iOS app draws with
 * its `\.playAudioTrack` environment key, so a player component stays usable on
 * its own (Storybook, tests) without a page-wide engine behind it.
 */
export function useAudioPlayer(): AudioPlayerValue | null {
  return useContext(AudioPlayerContext);
}

/** Keeps `track` in the page queue for as long as the caller is mounted. */
export function useAudioQueueEntry(track: AudioTrack | null): void {
  const registerTrack = useAudioPlayer()?.registerTrack;
  const { src, title, artist, artwork } = track ?? {};

  useEffect(() => {
    if (!registerTrack || !src) {
      return;
    }
    return registerTrack({ src, title, artist, artwork });
  }, [registerTrack, src, title, artist, artwork]);
}
