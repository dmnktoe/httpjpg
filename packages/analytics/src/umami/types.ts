interface UmamiTracker {
  track: {
    (): void;
    (eventName: string): void;
    (eventName: string, eventData: Record<string, unknown>): void;
    (payload: Record<string, unknown>): void;
  };
  identify: (id: string, data?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export {};
