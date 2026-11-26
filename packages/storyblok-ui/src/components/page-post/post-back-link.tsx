"use client";

import { Link } from "@httpjpg/ui";
import type { MouseEvent } from "react";

import { isPlainClick, takeFeedOrigin } from "../post/lib";

const FEED_PATH = "/feed";

export function PostBackLink() {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) {
      return;
    }
    if (takeFeedOrigin(window.location.pathname, window.history.length)) {
      event.preventDefault();
      window.history.back();
    }
  };

  return (
    <Link
      href={FEED_PATH}
      data-cursor="back"
      onClick={handleClick}
      css={{
        display: "inline-block",
        mb: "4",
        fontFamily: "mono",
        fontSize: "sm",
        textDecoration: "none",
      }}
    >
      [ ← feed ]
    </Link>
  );
}
