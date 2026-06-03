"use client";

import { type ConsentCategory, getConsent } from "@httpjpg/consent";
import { type ReactNode, useEffect, useState } from "react";

interface ConsentGateProps {
  category: ConsentCategory;
  children: ReactNode;
}

export function ConsentGate({ category, children }: ConsentGateProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(getConsent()?.[category] === true);
    sync();
    window.addEventListener("consentChange", sync);
    return () => window.removeEventListener("consentChange", sync);
  }, [category]);

  return allowed ? <>{children}</> : null;
}
