"use client";

import { Link, useFeedEditor } from "@httpjpg/ui";

const COMPOSE_PATH = "/feed/compose";

export function PostEditLink() {
  const isEditor = useFeedEditor();
  if (!isEditor) {
    return null;
  }
  const slug = window.location.pathname.split("/").filter(Boolean).pop() ?? "";

  return (
    <Link
      href={`${COMPOSE_PATH}?post=${encodeURIComponent(slug)}`}
      css={{ fontFamily: "mono", fontSize: "sm", textDecoration: "none" }}
    >
      [ edit ]
    </Link>
  );
}
