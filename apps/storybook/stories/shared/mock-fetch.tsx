import type { Decorator } from "@storybook/react";
import { useEffect, useRef } from "react";

// The Discord and Letterboxd widgets fetch their own data on mount. In
// Storybook there is no backend, so this decorator answers requests to the
// widget's endpoint with a fixed JSON payload and delegates everything else to
// the real fetch. The swap happens during render (not in an effect) because the
// child widget's mount effect fires before the decorator's effects would — the
// effect cleanup restores the original fetch on unmount.
export function withMockJson(endpoint: string, payload: unknown): Decorator {
  return function MockJsonDecorator(Story) {
    const originalRef = useRef(globalThis.fetch);
    const original = originalRef.current;

    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes(endpoint)) {
        return Promise.resolve({ ok: true, status: 200, json: async () => payload } as Response);
      }
      return original(input, init);
    }) as typeof fetch;

    useEffect(() => {
      return () => {
        globalThis.fetch = original;
      };
    }, [original]);

    return <Story />;
  };
}
