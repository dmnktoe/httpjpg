"use client";

import {
  type CommandPaletteAction,
  CommandPalette,
  type CommandPaletteMediaItem,
  type CommandPaletteResult,
  type CommandPaletteStatus,
  OPEN_SEARCH_EVENT,
} from "@httpjpg/ui";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PaletteLink } from "@/lib/queries/config";
import { type AskNavigateAction, readAskStream } from "@/lib/search/ask-stream";
import { filterPaletteLinks, mergePaletteResults } from "@/lib/search/palette-links";

export interface AskWidgetProps {
  /** False when the deployment has no Groq key — search still works. */
  askEnabled?: boolean;
  /** Header / footer / social shortcuts merged into palette results. */
  links?: PaletteLink[];
}

/** Long enough to skip most intermediate keystrokes, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 140;

const EMPTY_LINKS: PaletteLink[] = [];

interface SearchResponse {
  results?: Array<{
    id: string;
    title: string;
    href: string;
    kind: "work" | "page";
    excerpt?: string;
    media?: CommandPaletteMediaItem[];
  }>;
  suggestions?: string[];
}

export function AskWidget({ askEnabled = true, links = EMPTY_LINKS }: AskWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResult[]>(() =>
    mergePaletteResults(filterPaletteLinks(links, ""), []),
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Array<{ title: string; href: string }>>([]);
  const [action, setAction] = useState<AskNavigateAction>();
  const [status, setStatus] = useState<CommandPaletteStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

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

  // The palette lives in the layout, so it survives navigation. Anything that
  // changes the route while it is open — a source link, the back button —
  // should leave it behind, the same way the header drops its mobile menu.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, handleOpen);
  }, []);

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
    const matchedLinks = filterPaletteLinks(links, trimmed);

    if (!trimmed) {
      setResults(mergePaletteResults(matchedLinks, []));
      setSuggestions([]);
      setStatus("idle");
      return;
    }

    // Show matching shortcuts immediately while the Storyblok search is in flight.
    setResults(mergePaletteResults(matchedLinks, []));

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
        // A superseded search must not write its results, and must not report
        // "idle" over a stream that started after it did.
        if (controller.signal.aborted || searchAbort.current !== controller) {
          return;
        }
        setResults(mergePaletteResults(matchedLinks, data.results ?? []));
        setSuggestions(data.suggestions ?? []);
        setStatus("idle");
      } catch (error) {
        if (controller.signal.aborted || searchAbort.current !== controller) {
          return;
        }
        console.error("Search request failed:", error);
        setResults(mergePaletteResults(matchedLinks, []));
        setSuggestions([]);
        setStatus("idle");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen, links]);

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
    // Cmd+Enter can fire while a debounced search is still in flight, and its
    // late "idle" would make a streaming answer look finished.
    searchAbort.current?.abort();

    const controller = new AbortController();
    askAbort.current?.abort();
    askAbort.current = controller;

    setAnswer("");
    setSources([]);
    setAction(undefined);
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
        } else if (event.type === "action") {
          setAction(event.action);
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
    askAbort.current?.abort();
    setAnswer("");
    setSources([]);
    setAction(undefined);
    setErrorMessage(undefined);
  }, []);

  const handleAction = useCallback(
    (target: CommandPaletteAction) => {
      close();
      router.push(target.href);
    },
    [close, router],
  );

  return (
    <CommandPalette
      open={isOpen}
      query={query}
      results={results}
      suggestions={suggestions}
      answer={answer}
      sources={sources}
      action={action}
      status={status}
      errorMessage={errorMessage}
      askEnabled={askEnabled}
      onQueryChange={handleQueryChange}
      onClose={close}
      onSelect={handleSelect}
      onAsk={handleAsk}
      onAction={handleAction}
    />
  );
}
