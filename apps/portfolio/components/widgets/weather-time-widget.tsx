"use client";

import { env } from "@httpjpg/env";
import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

const TIMEZONE = env.NEXT_PUBLIC_WEATHER_TIMEZONE;

function formatTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function formatOffset(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());
  const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "UTC";
  return name.replace("GMT", "UTC");
}

interface Weather {
  temperature: number;
  emoji: string;
  condition: string;
}

export function WeatherTime() {
  const [time, setTime] = useState<string | null>(null);
  const [offset, setOffset] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    setOffset(formatOffset());
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
            setWeather({
              temperature: data.temperature,
              emoji: data.emoji,
              condition: data.condition ?? "",
            });
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
      <Box as="span" css={{ opacity: 90, letterSpacing: "0.12em" }}>
        {time}
      </Box>
      <Box as="span" css={{ opacity: 50 }}>
        {offset}
      </Box>
      {weather && (
        <>
          <Box as="span" aria-hidden="true">
            {weather.emoji}
          </Box>
          {weather.condition && (
            <Box as="span" css={{ opacity: 70 }}>
              {weather.condition}
            </Box>
          )}
          <Box as="span" css={{ opacity: 50 }}>
            ·
          </Box>
          <Box as="span" css={{ opacity: 70 }}>
            {Math.round(weather.temperature)}°
          </Box>
        </>
      )}
    </Box>
  );
}
