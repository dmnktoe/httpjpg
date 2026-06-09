"use client";

import { env } from "@httpjpg/env";
import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

const TIMEZONE = env.NEXT_PUBLIC_WEATHER_TIMEZONE;

const GLITCH_STYLE = `
.weather-glitch { position: relative; display: inline-block; }
.weather-glitch::before,
.weather-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  color: inherit;
  background: transparent;
  pointer-events: none;
}
.weather-glitch::before {
  text-shadow: -1px 0 #ff2d75;
  animation: weather-glitch-a 2.6s infinite linear alternate-reverse;
}
.weather-glitch::after {
  text-shadow: 1px 0 #00e5ff;
  animation: weather-glitch-b 1.9s infinite linear alternate-reverse;
}
@keyframes weather-glitch-a {
  0%, 100% { clip-path: inset(0 0 88% 0); }
  20% { clip-path: inset(50% 0 30% 0); }
  40% { clip-path: inset(15% 0 65% 0); }
  60% { clip-path: inset(70% 0 8% 0); }
  80% { clip-path: inset(35% 0 45% 0); }
}
@keyframes weather-glitch-b {
  0%, 100% { clip-path: inset(60% 0 20% 0); }
  25% { clip-path: inset(10% 0 75% 0); }
  50% { clip-path: inset(80% 0 5% 0); }
  75% { clip-path: inset(30% 0 50% 0); }
}
@media (prefers-reduced-motion: reduce) {
  .weather-glitch::before,
  .weather-glitch::after { animation: none; text-shadow: none; }
}
`;

function formatTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

interface Weather {
  temperature: number;
  emoji: string;
}

export function WeatherTime() {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    setTime(formatTime());
    const interval = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await fetch("/api/weather");
        if (response.ok) {
          const data = await response.json();
          if (typeof data?.emoji === "string") {
            setWeather({ temperature: data.temperature, emoji: data.emoji });
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchCurrent();
  }, []);

  if (!time) {
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
      <style>{GLITCH_STYLE}</style>
      <Box as="span" css={{ opacity: 40, letterSpacing: "0.1em" }} aria-hidden="true">
        ▓▒░
      </Box>
      <Box
        as="span"
        className="weather-glitch"
        data-text={time}
        css={{ opacity: 90, letterSpacing: "0.12em" }}
      >
        {time}
      </Box>
      {weather && (
        <>
          <Box as="span" aria-hidden="true">
            {weather.emoji}
          </Box>
          <Box as="span" css={{ opacity: 70 }}>
            {Math.round(weather.temperature)}°
          </Box>
        </>
      )}
      <Box as="span" css={{ opacity: 40, letterSpacing: "0.1em" }} aria-hidden="true">
        ░▒▓
      </Box>
    </Box>
  );
}
