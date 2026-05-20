"use client";

import { CONSOLE_BANNER } from "@httpjpg/ui";
import { useEffect } from "react";

export function ConsoleBanner() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const w = window as unknown as { __httpjpgBannerLogged?: boolean };
    if (w.__httpjpgBannerLogged) {
      return;
    }
    w.__httpjpgBannerLogged = true;

    const titleStyle = "color: #f72585; font-family: monospace; font-size: 12px; line-height: 1.1;";
    const hintStyle = "color: #00bbf9; font-family: monospace; font-size: 11px;";

    console.log(`%c${CONSOLE_BANNER}`, titleStyle);
    console.log("%c·°•. ⋆  curious dev?  ⋆ .•°·", hintStyle);
    console.log(
      "%csource: https://github.com/dmnktoe/httpjpg",
      "color: #9b5de5; font-family: monospace; font-size: 11px;",
    );
  }, []);

  return null;
}
