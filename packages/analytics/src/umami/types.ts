declare global {
  interface Window {
    umami: {
      track: {
        (): void;
        (eventName: string): void;
        (eventName: string, eventData: Record<string, string | number | boolean>): void;
        (
          callback: (props: {
            hostname: string;
            language: string;
            referrer: string;
            screen: string;
            title: string;
            url: string;
            website: string;
          }) => Record<string, string | number | boolean>,
        ): void;
      };
    };
  }
}

export {};
