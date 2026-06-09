"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { LetterboxdFilm } from "@/lib/integrations/letterboxd";

// Ratings are 0.5–5 in half steps (★★★★½).
function formatRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? "½" : "";
  return "★".repeat(full) + half;
}

export function LetterboxdStatus() {
  const [film, setFilm] = useState<LetterboxdFilm | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch("/api/letterboxd");
        if (response.ok) {
          const data = await response.json();
          setFilm(data.films?.[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch Letterboxd films:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchFilms();
  }, []);

  // Hold the footer line with a loading label while the request is in flight so
  // it doesn't jump when the film pops in; collapse only once we know it's empty.
  if (!film) {
    if (loaded) {
      return null;
    }
    return (
      <Box
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          minHeight: "5",
          opacity: 80,
          fontFamily: "mono",
          fontSize: "xs",
        }}
      >
        <Box as="span" css={{ opacity: 60 }}>
          letterboxd:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

  return (
    <Box
      as="a"
      href={film.url}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        letterboxd:
      </Box>
      {film.poster && (
        <Box
          as="span"
          css={{
            display: "inline-block",
            width: "3",
            height: "auto",
            verticalAlign: "middle",
            borderRadius: "sm",
            overflow: "hidden",
          }}
        >
          <img
            src={film.poster}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
      )}
      <Box
        as="span"
        css={{
          maxWidth: "200px",
          opacity: 70,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {film.title}
      </Box>
      {film.year && (
        <Box as="span" css={{ opacity: 50 }}>
          {film.year}
        </Box>
      )}
      {film.liked && (
        <Box as="span" aria-label="liked" css={{ color: "accent.500", opacity: 80 }}>
          ♥
        </Box>
      )}
      {film.rating !== null && (
        <>
          <Box as="span" css={{ opacity: 50 }}>
            ·
          </Box>
          <Box as="span" css={{ opacity: 70 }}>
            {formatRating(film.rating)}
          </Box>
        </>
      )}
    </Box>
  );
}
