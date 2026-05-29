import "./types";

function isUmamiAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.umami !== "undefined";
}

export interface UmamiEventData {
  [key: string]: string | number | boolean;
}

export function trackEvent(eventName: string, eventData?: UmamiEventData): void {
  if (!isUmamiAvailable()) {
    return;
  }

  try {
    if (eventData) {
      window.umami.track(eventName, eventData);
    } else {
      window.umami.track(eventName);
    }
  } catch (error) {
    console.error("Umami tracking failed:", error);
  }
}

export function trackWebVital(name: "CLS" | "FCP" | "LCP" | "TTFB" | "INP", value: number): void {
  trackEvent("web-vital", {
    metric: name,
    value: Math.round(value),
  });
}
