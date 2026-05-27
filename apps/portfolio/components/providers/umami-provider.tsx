"use client";

import { hasVendorConsent } from "@httpjpg/consent";
import { useEffect, useRef } from "react";

interface UmamiProviderProps {
  websiteId: string;
  host: string;
}

export function UmamiProvider({ websiteId, host }: UmamiProviderProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    function injectScript() {
      if (scriptRef.current) {
        return;
      }

      if (!hasVendorConsent("umami")) {
        return;
      }

      const script = document.createElement("script");
      script.defer = true;
      script.src = `${host}/script.js`;
      script.dataset.websiteId = websiteId;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    function removeScript() {
      if (!scriptRef.current) {
        return;
      }
      scriptRef.current.remove();
      scriptRef.current = null;
      delete (window as any).umami;
    }

    function handleConsentChange() {
      if (hasVendorConsent("umami")) {
        injectScript();
      } else {
        removeScript();
      }
    }

    handleConsentChange();
    window.addEventListener("consentChange", handleConsentChange);
    return () => {
      window.removeEventListener("consentChange", handleConsentChange);
    };
  }, [websiteId, host]);

  return null;
}
