"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { LetterboxdFilm } from "@/lib/integrations/letterboxd";

export interface LetterboxdStatusProps {
  film: LetterboxdFilm | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

// Ratings are 0.5–5 in half steps (★★★★½).
function formatRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? "½" : "";
  return "★".repeat(full) + half;
}

export function LetterboxdStatus({ film, loaded }: LetterboxdStatusProps) {
  if (!film) {
    return loaded ? null : <FooterStatusLine label="letterboxd" loading />;
  }

  return (
    <FooterStatusLine label="letterboxd" href={film.url}>
      {film.poster && <FooterStatusLineThumb src={film.poster} aspect="auto" />}
      <FooterStatusLineText>{film.title}</FooterStatusLineText>
      {film.year && (
        <FooterStatusLineText fixed dim>
          {film.year}
        </FooterStatusLineText>
      )}
      {film.liked && (
        <FooterStatusLineText fixed aria-label="liked" css={{ color: "accent.500", opacity: 0.8 }}>
          ♥
        </FooterStatusLineText>
      )}
      {film.rating !== null && (
        <>
          <FooterStatusLineSeparator />
          <FooterStatusLineText fixed>{formatRating(film.rating)}</FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}
