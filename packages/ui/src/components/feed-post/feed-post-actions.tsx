"use client";

import { useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";

const ACTION_CLASS = css({
  boxSizing: "border-box",
  fontFamily: "mono",
  fontSize: "md",
  lineHeight: 1,
  transition: "transform 0.15s, color 0.15s",
  cursor: "pointer",
  userSelect: "none",
  all: "unset",
  _hover: { opacity: 0.6 },
  _active: { transform: "scale(0.8)" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
  "&[aria-pressed=true]": { color: "danger.500", transform: "scale(1.15)" },
});

export function FeedPostActions() {
  const [isLiked, setIsLiked] = useState(false);
  const [isNoteShown, setIsNoteShown] = useState(false);

  return (
    <Box data-feed-meta="" css={{ display: "flex", alignItems: "center", gap: "3", minH: "6" }}>
      <button
        type="button"
        aria-label="Like"
        aria-pressed={isLiked}
        className={ACTION_CLASS}
        onClick={() => setIsLiked((current) => !current)}
      >
        {isLiked ? "[ ♥︎ ]" : "[ ♡ ]"}
      </button>
      <button
        type="button"
        aria-label="Comment"
        aria-expanded={isNoteShown}
        className={ACTION_CLASS}
        onClick={() => setIsNoteShown((current) => !current)}
      >
        [ ✎ ]
      </button>
      {isNoteShown && (
        <Box as="output" css={{ opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
          comments are off ･ﾟ⋆ just pics
        </Box>
      )}
    </Box>
  );
}
