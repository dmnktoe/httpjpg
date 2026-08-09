import { CommandPalette, type CommandPaletteResult } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

const RESULTS: CommandPaletteResult[] = [
  {
    id: "1",
    title: "Brutalist Portfolio",
    href: "/work/brutalist-portfolio",
    kind: "work",
    excerpt: "A stark, type-led site driven by Storyblok and Next.js.",
  },
  {
    id: "2",
    title: "Poster Series",
    href: "/work/poster-series",
    kind: "work",
    excerpt: "Risograph posters printed in two spot colours.",
  },
  {
    id: "3",
    title: "Nostalgia Slideshow",
    href: "/work/nostalgia-slideshow",
    kind: "work",
  },
  {
    id: "4",
    title: "About",
    href: "/about",
    kind: "page",
    excerpt: "Who I am and what I make.",
  },
];

const SOURCES = [
  { title: "Brutalist Portfolio", href: "/work/brutalist-portfolio" },
  { title: "About", href: "/about" },
];

const ANSWER =
  "The portfolio is a brutalist, type-led site built on Next.js and Storyblok [1]. Most of the work listed is print and web design [1][2].";

const meta = {
  title: "Widgets/CommandPalette",
  component: CommandPalette,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  // The palette is fully controlled. Stories that only need to look right take
  // these no-ops; Playground swaps in real state so it can be typed into.
  args: {
    open: true,
    query: "",
    results: [],
    onQueryChange: () => {},
    onClose: () => {},
    onSelect: () => {},
    onAsk: () => {},
  },
  argTypes: {
    status: {
      control: { type: "select" as const },
      options: ["idle", "searching", "answering", "error"],
      table: { defaultValue: { summary: "idle" } },
    },
    askEnabled: {
      control: "boolean",
      description: "Hides the ask affordance when the deployment has no AI key.",
      table: { defaultValue: { summary: "true" } },
    },
    open: { control: "boolean" },
    query: { control: "text" },
    answer: { control: "text" },
    errorMessage: { control: "text" },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Live palette: typing filters the fixture list and the autocomplete chips the
 * same way the real index does, so keyboard navigation can be tried out here.
 */
export const Playground: Story = {
  args: {
    query: "poster",
    results: RESULTS,
    suggestions: ["Poster Series", "Print"],
    status: "idle",
    askEnabled: true,
  },
  render: (args) => {
    const InteractiveDemo = () => {
      const [query, setQuery] = useState(args.query);
      const needle = query.trim().toLowerCase();
      const results = needle
        ? RESULTS.filter((result) => result.title.toLowerCase().includes(needle))
        : RESULTS;
      const suggestions = needle
        ? RESULTS.map((result) => result.title).filter(
            (title) => title.toLowerCase().includes(needle) && title.toLowerCase() !== needle,
          )
        : [];

      return (
        <CommandPalette
          {...args}
          query={query}
          results={results}
          suggestions={suggestions}
          onQueryChange={setQuery}
        />
      );
    };

    return <InteractiveDemo />;
  },
};

export const Empty: Story = {
  args: {
    query: "",
    results: [],
  },
};

export const NoMatches: Story = {
  args: {
    query: "kubernetes",
    results: [],
  },
};

export const Searching: Story = {
  args: {
    query: "brutal",
    results: [],
    status: "searching",
  },
};

/** Autocomplete only — suggestions arrive before the ranked results do. */
export const Autocomplete: Story = {
  args: {
    query: "pos",
    results: [],
    suggestions: ["Poster Series", "Posters", "Print"],
  },
};

export const WithAnswer: Story = {
  args: {
    query: "what is this site?",
    results: RESULTS.slice(0, 2),
    answer: ANSWER,
    sources: SOURCES,
    status: "idle",
  },
};

export const AnswerFailed: Story = {
  args: {
    query: "what is this site?",
    results: RESULTS.slice(0, 2),
    status: "error",
    errorMessage: "The model is busy. Try again in a moment.",
  },
};

/** Search-only build: no Groq key, so the ask affordance is withheld. */
export const AskDisabled: Story = {
  args: {
    query: "poster",
    results: RESULTS,
    askEnabled: false,
  },
};

/** Types the answer out token by token, the way the real stream renders. */
export const StreamingAnswer: Story = {
  args: {
    query: "what is this site?",
    results: RESULTS.slice(0, 2),
    sources: SOURCES,
  },
  render: (args) => {
    const StreamingDemo = () => {
      const [answer, setAnswer] = useState("");

      useEffect(() => {
        const words = ANSWER.split(" ");
        let index = 0;
        const interval = setInterval(() => {
          index += 1;
          setAnswer(words.slice(0, index).join(" "));
          if (index >= words.length) {
            clearInterval(interval);
          }
        }, 90);
        return () => clearInterval(interval);
      }, []);

      const isDone = answer === ANSWER;
      return <CommandPalette {...args} answer={answer} status={isDone ? "idle" : "answering"} />;
    };

    return <StreamingDemo />;
  },
};
