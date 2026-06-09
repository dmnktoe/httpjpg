export interface WeatherFetchResult {
  ok: true;
  temperature: number;
  code: number;
  emoji: string;
}

export type WeatherResult = WeatherFetchResult | { ok: false; status: number; message: string };

const WEATHER_TIMEOUT_MS = 5000;

export function weatherEmoji(code: number): string {
  if (code === 0) {
    return "☀️";
  }
  if (code === 1 || code === 2) {
    return "⛅";
  }
  if (code === 3) {
    return "☁️";
  }
  if (code === 45 || code === 48) {
    return "🌫️";
  }
  if (code >= 51 && code <= 57) {
    return "🌦️";
  }
  if (code >= 61 && code <= 67) {
    return "🌧️";
  }
  if (code >= 71 && code <= 77) {
    return "🌨️";
  }
  if (code >= 80 && code <= 82) {
    return "🌧️";
  }
  if (code === 85 || code === 86) {
    return "🌨️";
  }
  if (code >= 95) {
    return "⛈️";
  }
  return "🌡️";
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherResult> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, status: 504, message: "Weather request timed out." };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return { ok: false, status: response.status, message: `Status ${response.status}.` };
  }

  const data = await response.json();
  const code = Number(data?.current?.weather_code);
  const temperature = Number(data?.current?.temperature_2m);
  if (Number.isNaN(code) || Number.isNaN(temperature)) {
    return { ok: false, status: 502, message: "Malformed weather response." };
  }

  return { ok: true, temperature, code, emoji: weatherEmoji(code) };
}
