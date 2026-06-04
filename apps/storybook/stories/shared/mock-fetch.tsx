import type { Decorator } from "@storybook/react";
import { useEffect, useRef } from "react";

// The Discord and Letterboxd widgets fetch their own data on mount. In
// Storybook there is no backend, so this decorator swaps `globalThis.fetch`
// for one that resolves with a fixed JSON payload, then restores it on unmount
// so other stories keep their real fetch.
export function withMockJson(payload: unknown): Decorator {
  return function MockJsonDecorator(Story) {
    const originalRef = useRef(globalThis.fetch);

    globalThis.fetch = (async () =>
      ({ ok: true, status: 200, json: async () => payload }) as Response) as typeof fetch;

    useEffect(() => {
      const original = originalRef.current;
      return () => {
        globalThis.fetch = original;
      };
    }, []);

    return <Story />;
  };
}
