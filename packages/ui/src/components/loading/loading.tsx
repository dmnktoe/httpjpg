"use client";

import { useEffect, useState } from "react";
import { token } from "styled-system/tokens";

const colors = [
  "#ff0000",
  "#ff7f00",
  "#ffff00",
  "#00ff00",
  "#0000ff",
  "#4b0082",
  "#9400d3",
];

/**
 * Rainbow Loading Text Component
 * Fast rainbow color animation for loading states
 */
export function Loading() {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 100); // 100ms per color

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        fontSize: token("fontSizes.sm"), // token: fontSizes.sm (12px)
        color: colors[colorIndex],
        transition: "color 0.07s linear",
      }}
    >
      Loading...
    </span>
  );
}
