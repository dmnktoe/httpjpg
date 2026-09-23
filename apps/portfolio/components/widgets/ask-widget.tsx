"use client";

import {
  trackAskAction,
  trackAskComplete,
  trackAskError,
  trackAskSubmit,
  trackSearchOpen,
  trackSearchSelect,
} from "@httpjpg/analytics";
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

import { type AskNavigateAction, readAskStream } from "@/lib/search/ask-stream";

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
    media?: CommandPaletteMediaItem[];
  }>;
  suggestions?: string[];
}

export function AskWidget({ askEnabled = true }: AskWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteResult[]>([]);
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

  const openFrom = useCallback((source: "keyboard" | "trigger") => {
    setIsOpen((open) => {
      if (!open) {
        trackSearchOpen(source);
      }
      return true;
    });
  }, []);

  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((open) => {
          if (open) {
            return false;
          }
          trackSearchOpen("keyboard");
          return true;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOpen = () => openFrom("trigger");
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, handleOpen);
  }, [openFrom]);

  useEffect(() => {
    return () => {
      searchAbort.current?.abort();
      askAbort.current?.abort();
    };
  }, []);

  const trimmedQuery = isOpen ? query.trim() : "";
  if (!trimmedQuery && (results.length > 0 || suggestions.length > 0 || status !== "idle")) {
    setResults([]);
    setSuggestions([]);
    setStatus("idle");
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    searchAbort.current?.abort();
    searchAbort.current = controller;

    const timer = setTimeout(async () => {
      setStatus("searching");
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
        setResults(data.results ?? []);
        setSuggestions(data.suggestions ?? []);
        setStatus("idle");
      } catch (error) {
        if (controller.signal.aborted || searchAbort.current !== controller) {
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
      trackSearchSelect({
        kind: result.kind,
        href: result.href,
        queryLength: query.trim().length,
        title: result.title,
      });
      close();
      if (result.href.startsWith("http")) {
        window.open(result.href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(result.href);
    },
    [close, query, router],
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
    trackAskSubmit({ queryLength: question.trim().length });

    let sourceCount = 0;
    let hasAction = false;

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setStatus("error");
        const reason =
          response.status === 503
            ? "Ask is not available on this deployment."
            : "The answer failed. Try the search results instead.";
        setErrorMessage(reason);
        trackAskError({ reason: response.status === 503 ? "unavailable" : "http_error" });
        return;
      }

      for await (const event of readAskStream(response.body)) {
        if (event.type === "sources") {
          sourceCount = event.sources.length;
          setSources(event.sources);
        } else if (event.type === "delta") {
          setAnswer((current) => current + event.text);
        } else if (event.type === "action") {
          hasAction = true;
          setAction(event.action);
        } else {
          setStatus("error");
          setErrorMessage(
            event.error === "ai_busy"
              ? "The model is busy. Try again in a moment."
              : "The answer failed. Try the search results instead.",
          );
          trackAskError({ reason: event.error === "ai_busy" ? "ai_busy" : "stream_error" });
          return;
        }
      }

      setStatus("idle");
      trackAskComplete({ hasAction, sourceCount });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error("Ask request failed:", error);
      setStatus("error");
      setErrorMessage("The answer failed. Try the search results instead.");
      trackAskError({ reason: "network_error" });
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
      trackAskAction({ href: target.href, title: target.title, kind: target.kind });
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
