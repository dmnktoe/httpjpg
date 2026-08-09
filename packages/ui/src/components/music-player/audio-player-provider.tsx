"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AudioPlayerValue, AudioTrack } from "./audio-player-context";
import { AudioPlayerContext } from "./audio-player-context";

/**
 * Owns the one `<audio>` element of the site. It is mounted in the root layout,
 * which App Router keeps alive across client navigations — that, and nothing
 * else, is what makes playback survive a page change.
 */
export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Tracks whose blok is mounted right now, in mount order.
  const registryRef = useRef<AudioTrack[]>([]);
  // The queue playback walks. Snapshotted from the registry when playback
  // starts, so navigating away cannot empty it under the running track.
  const queueRef = useRef<AudioTrack[]>([]);
  const trackRef = useRef<AudioTrack | null>(null);

  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const registerTrack = useCallback((entry: AudioTrack) => {
    const stamped = withPage(entry);
    registryRef.current = [...registryRef.current, stamped];
    return () => {
      registryRef.current = registryRef.current.filter((item) => item !== stamped);
    };
  }, []);

  // Swapping `src` on the element instead of rendering it keeps play() inside
  // the click that asked for it, which is what autoplay policies look at.
  const start = useCallback((next: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (trackRef.current?.src !== next.src) {
      trackRef.current = next;
      setTrack(next);
      setCurrentTime(0);
      setDuration(0);
      audio.src = next.src;
    }

    void audio.play().catch(() => {
      // Blocked playback fires no play event, so isPlaying already reads false.
    });
  }, []);

  const play = useCallback(
    (next: AudioTrack) => {
      const snapshot = dedupeBySrc(registryRef.current);
      // Prefer the registered entry: it carries the page it was stamped with.
      const queued = snapshot.find((item) => item.src === next.src);
      const target = queued ?? withPage(next);
      const withTrack = queued ? snapshot : [target];
      queueRef.current = withTrack;
      setQueue(withTrack);
      start(target);
    },
    [start],
  );

  const step = useCallback(
    (offset: number) => {
      const current = trackRef.current;
      if (!current) {
        return;
      }
      const index = queueRef.current.findIndex((item) => item.src === current.src);
      const target = index >= 0 ? queueRef.current[index + offset] : undefined;
      if (target) {
        start(target);
      }
    },
    [start],
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) {
      return;
    }

    if (audio.paused) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();
    // Drops the buffered resource; the element is reused for the next track.
    audio?.removeAttribute("src");
    trackRef.current = null;
    queueRef.current = [];
    setTrack(null);
    setQueue([]);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const syncPlaybackState = () => setIsPlaying(!audio.paused);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", syncPlaybackState);
    audio.addEventListener("pause", syncPlaybackState);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", syncPlaybackState);
      audio.removeEventListener("pause", syncPlaybackState);
    };
  }, []);

  const index = track ? queue.findIndex((item) => item.src === track.src) : -1;
  const hasNext = index >= 0 && index < queue.length - 1;
  const hasPrevious = index > 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleEnded = () => {
      if (hasNext) {
        next();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [hasNext, next]);

  // Lock screen and headphone buttons, the web counterpart of the iOS app's
  // MPRemoteCommandCenter wiring.
  useEffect(() => {
    const session = typeof navigator === "undefined" ? undefined : navigator.mediaSession;
    if (!session?.setActionHandler) {
      return;
    }

    const handlers = [
      ["play", toggle],
      ["pause", toggle],
      ["previoustrack", previous],
      ["nexttrack", next],
    ] as const;

    for (const [action, handler] of handlers) {
      session.setActionHandler(action, handler);
    }

    return () => {
      for (const [action] of handlers) {
        session.setActionHandler(action, null);
      }
    };
  }, [next, previous, toggle]);

  useEffect(() => {
    const session = typeof navigator === "undefined" ? undefined : navigator.mediaSession;
    if (!session) {
      return;
    }

    session.playbackState = isPlaying ? "playing" : "paused";

    if (typeof MediaMetadata === "undefined") {
      return;
    }

    session.metadata = track
      ? new MediaMetadata({
          title: track.title || "untitled",
          artist: track.artist,
          artwork: track.artwork ? [{ src: track.artwork }] : undefined,
        })
      : null;
  }, [isPlaying, track]);

  const value = useMemo<AudioPlayerValue>(
    () => ({
      track,
      isPlaying,
      currentTime,
      duration,
      hasNext,
      hasPrevious,
      play,
      toggle,
      next,
      previous,
      seek,
      stop,
      registerTrack,
    }),
    [
      track,
      isPlaying,
      currentTime,
      duration,
      hasNext,
      hasPrevious,
      play,
      toggle,
      next,
      previous,
      seek,
      stop,
      registerTrack,
    ],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" aria-label={track?.title || "Audio player"} />
    </AudioPlayerContext.Provider>
  );
}

function withPage(track: AudioTrack): AudioTrack {
  if (track.href || typeof window === "undefined") {
    return track;
  }
  // Registration happens in an effect, so the router is already showing the
  // page this blok sits on.
  return { ...track, href: window.location.pathname };
}

function dedupeBySrc(tracks: AudioTrack[]): AudioTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.src)) {
      return false;
    }
    seen.add(track.src);
    return true;
  });
}
