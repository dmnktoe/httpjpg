"use client";

import { Link, useFeedEditor } from "@httpjpg/ui";
import { usePathname } from "next/navigation";

const UPLOAD_PATH = "/feed/upload";

export function PostEditLink() {
  const isEditor = useFeedEditor();
  const pathname = usePathname();
  const slug = pathname?.split("/").filter(Boolean).pop();
  if (!isEditor || !slug) {
    return null;
  }

  return (
    <Link
      href={`${UPLOAD_PATH}?post=${encodeURIComponent(slug)}`}
      css={{ fontFamily: "mono", fontSize: "sm", textDecoration: "none" }}
    >
      [ edit ]
    </Link>
  );
}
