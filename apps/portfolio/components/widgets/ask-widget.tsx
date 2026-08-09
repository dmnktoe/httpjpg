"use client";

import {
  CommandPalette,
  type CommandPaletteResult,
  type CommandPaletteStatus,
  OPEN_SEARCH_EVENT,
} from "@httpjpg/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { readAskStream } from "@/lib/search/ask-stream";

export interface AskWidgetProps {
  /** False when the deployment has no Groq key — search still works. */
  askEnabled?: boolean;
}

/** Long enough to skip most intermediate keystrokes, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 140;

interface SearchResponse {
  results?: Array<{
    id: string;
    title: string;
    href: string;
    kind: "work" | "page";
    excerpt?: string;
  }>;
  suggestions?: string[];
}

export function AskWidget({ askEnabled = true }: AskWidgetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Array<{ title: string; href: string }>>([]);
  const [status, setStatus] = useState<CommandPaletteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  // One controller per in-flight request kind, so a new keystroke cancels the
  // previous search and a new question cancels the previous answer.
  const searchAbort = useRef<AbortController>(null);
  const askAbort = useRef<AbortController>(null);

  const close = useCallback(() => {
    searchAbort.current?.abort();
    askAbort.current?.abort();
    setIsOpen(false);
    setStatus("idle");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // The header button is rendered by the Header, which sits in a different
  // subtree; it asks for the palette over the window the same way the footer's
  // cookie-settings button asks for the consent center.
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, handleOpen);
  }, []);

  // Abort anything still running when the widget unmounts.
  useEffect(() => {
    return () => {
      searchAbort.current?.abort();
      askAbort.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSuggestions([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    searchAbort.current?.abort();
    searchAbort.current = controller;
    setStatus("searching");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Search failed with ${response.status}`);
        }
        const data = (await response.json()) as SearchResponse;
        setResults(data.results ?? []);
        setSuggestions(data.suggestions ?? []);
        setStatus("idle");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Search request failed:", error);
        setResults([]);
        setSuggestions([]);
        setStatus("idle");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen]);

  const handleSelect = useCallback(
    (result: CommandPaletteResult) => {
      close();
      if (result.href.startsWith("http")) {
        window.open(result.href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(result.href);
    },
    [close, router],
  );

  const handleAsk = useCallback(async (question: string) => {
    const controller = new AbortController();
    askAbort.current?.abort();
    askAbort.current = controller;

    setAnswer("");
    setSources([]);
    setErrorMessage(undefined);
    setStatus("answering");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setStatus("error");
        setErrorMessage(
          response.status === 503
            ? "Ask is not available on this deployment."
            : "The answer failed. Try the search results instead.",
        );
        return;
      }

      for await (const event of readAskStream(response.body)) {
        if (event.type === "sources") {
          setSources(event.sources);
        } else if (event.type === "delta") {
          setAnswer((current) => current + event.text);
        } else {
          setStatus("error");
          setErrorMessage(
            event.error === "ai_busy"
              ? "The model is busy. Try again in a moment."
              : "The answer failed. Try the search results instead.",
          );
          return;
        }
      }

      setStatus("idle");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error("Ask request failed:", error);
      setStatus("error");
      setErrorMessage("The answer failed. Try the search results instead.");
    }
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    // A new query invalidates the answer that belonged to the old one.
    askAbort.current?.abort();
    setAnswer("");
    setSources([]);
    setErrorMessage(undefined);
  }, []);

  return (
    <CommandPalette
      open={isOpen}
      query={query}
      results={results}
      suggestions={suggestions}
      answer={answer}
      sources={sources}
      status={status}
      errorMessage={errorMessage}
      askEnabled={askEnabled}
      onQueryChange={handleQueryChange}
      onClose={close}
      onSelect={handleSelect}
      onAsk={handleAsk}
    />
  );
}
