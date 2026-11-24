"use client";

import { css } from "styled-system/css";

import { PickerShell } from "./picker-shell";
import { usePickerQuery } from "./use-picker-query";

interface Story {
  id: number;
  uuid: string;
  name: string;
  full_slug: string;
}

interface StoryPickerProps {
  open: boolean;
  startsWith?: string;
  onClose(): void;
  onPick(story: Story): void;
}

export function StoryPicker({ open, startsWith, onClose, onPick }: StoryPickerProps) {
  const { items: stories, controls } = usePickerQuery<Story>({
    open,
    endpoint: "/api/stories",
    itemsKey: "stories",
    perPage: 25,
    startsWith,
  });

  if (!open) return null;

  return (
    <PickerShell
      title={`Pick Story${startsWith ? ` (${startsWith}*)` : ""}`}
      searchLabel="Search stories"
      controls={controls}
      onClose={onClose}
    >
      <ul
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 1,
          margin: 0,
          padding: 0,
          listStyle: "none",
        })}
      >
        {stories.map((story) => (
          <li key={story.id}>
            <button
              type="button"
              onClick={() => onPick(story)}
              className={css({
                boxSizing: "border-box",
                display: "flex",
                gap: 2,
                width: "100%",
                padding: 2,
                border: "1px solid",
                borderColor: "pageBorder",
                cursor: "pointer",
                all: "unset",
                _hover: { color: "pageBg", bg: "pageFg" },
              })}
            >
              <span className={css({ flex: 1 })}>{story.name}</span>
              <span className={css({ opacity: 0.6, fontFamily: "mono", fontSize: "sm" })}>
                /{story.full_slug}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </PickerShell>
  );
}
