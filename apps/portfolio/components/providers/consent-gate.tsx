"use client";

import { type ExternalVendor, hasVendorConsent } from "@httpjpg/consent";
import { type ReactNode, useEffect, useState } from "react";

interface ConsentGateProps {
  vendor: ExternalVendor;
  children: ReactNode;
}

export function ConsentGate({ vendor, children }: ConsentGateProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasVendorConsent(vendor));
    sync();
    window.addEventListener("consentChange", sync);
    return () => window.removeEventListener("consentChange", sync);
  }, [vendor]);

  return allowed ? <>{children}</> : null;
}
