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
      }
    };

    fetchFilms();
  }, []);

  if (!film) {
    return null;
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
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
        _hover: { opacity: 100 },
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
          data-preview-image={film.poster}
          data-preview-ratio="2:3"
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
        data-preview-image={film.poster || undefined}
        data-preview-ratio="2:3"
      >
        {film.title}
      </Box>
      {film.year && (
        <Box as="span" css={{ opacity: 50 }}>
          {film.year}
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
