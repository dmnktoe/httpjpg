"use client";

import { Link, useFeedEditor } from "@httpjpg/ui";
import { usePathname } from "next/navigation";

const COMPOSE_PATH = "/feed/compose";

export function PostEditLink() {
  const isEditor = useFeedEditor();
  const pathname = usePathname();
  const slug = pathname?.split("/").filter(Boolean).pop();
  if (!isEditor || !slug) {
    return null;
  }

  return (
    <Link
      href={`${COMPOSE_PATH}?post=${encodeURIComponent(slug)}`}
      css={{ fontFamily: "mono", fontSize: "sm", textDecoration: "none" }}
    >
      [ edit ]
    </Link>
  );
}
