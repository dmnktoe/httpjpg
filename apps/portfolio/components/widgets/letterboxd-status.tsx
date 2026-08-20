"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { LetterboxdFilm } from "@/lib/integrations/letterboxd";
import { useWidgetData } from "@/lib/use-widget-data";

interface LetterboxdResponse {
  films?: LetterboxdFilm[];
}

// Ratings are 0.5–5 in half steps (★★★★½).
function formatRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? "½" : "";
  return "★".repeat(full) + half;
}

export function LetterboxdStatus() {
  const { data, loaded } = useWidgetData<LetterboxdResponse>("/api/letterboxd");
  const film = data?.films?.[0] ?? null;

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
