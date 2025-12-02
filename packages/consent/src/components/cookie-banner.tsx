"use client";

import { Box, Button } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { getConsent, hasConsent, setConsent } from "../consent";
import type { ConsentState } from "../types";
import { DEFAULT_CONSENT_STATE } from "../types";

interface CookieBannerProps {
  onAcceptAll?: (consent: ConsentState) => void;
  onRejectAll?: () => void;
  onSavePreferences?: (consent: ConsentState) => void;
}

export function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsentState] = useState<ConsentState>(
    DEFAULT_CONSENT_STATE,
  );

  useEffect(() => {
    // Check if user already gave consent
    if (!hasConsent()) {
      setIsVisible(true);
    } else {
      const savedConsent = getConsent();
      if (savedConsent) {
        setConsentState(savedConsent);
      }
    }

    // Listen for custom event to reopen banner
    const handleOpenSettings = () => {
      const savedConsent = getConsent();
      if (savedConsent) {
        setConsentState(savedConsent);
      }
      setShowDetails(true);
      setIsVisible(true);
    };

    window.addEventListener("openCookieSettings", handleOpenSettings);
    return () =>
      window.removeEventListener("openCookieSettings", handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: ConsentState = {
      analytics: true,
      monitoring: true,
      preferences: true,
    };
    setConsent(fullConsent);
    setIsVisible(false);
    onAcceptAll?.(fullConsent);
  };

  const handleRejectAll = () => {
    setConsent(DEFAULT_CONSENT_STATE);
    setIsVisible(false);
    onRejectAll?.();
  };

  const handleSavePreferences = () => {
    setConsent(consent);
    setIsVisible(false);
    onSavePreferences?.(consent);
  };

  const toggleCategory = (category: keyof ConsentState) => {
    // Don't allow toggling required categories
    if (category === "monitoring" || category === "preferences") {
      return;
    }

    setConsentState((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "white",
        color: "black",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", lineHeight: "1.4" }}>
        {/* Brutalist Header */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontWeight: "bold", fontSize: "14px" }}>
            ⇝🍪 ᴄᴏᴏᴋɪᴇ ᴘᴏʟɪᴄʏ 🍪⇝
          </span>
          <br />
          <span style={{ fontSize: "12px", opacity: 0.7 }}>
            ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ &&& ——— 𝒸𝑜𝑜𝓀𝒾𝑒𝓈 𝒸𝑜𝑜𝓀𝒾𝑒𝓈
            :)))))
          </span>
        </div>

        {/* Main Message */}
        <div style={{ marginBottom: "16px", fontSize: "12px" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            🎀 ⋆ﾟ･ We use cookies for analytics & monitoring. You can customize
            your preferences below. ⋆ﾟ･ 🎀
          </p>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              border: "2px solid black",
              backgroundColor: "#f5f5f5",
              fontSize: "12px",
            }}
          >
            {/* Analytics */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={() => toggleCategory("analytics")}
                  style={{
                    marginTop: "2px",
                    marginRight: "12px",
                    cursor: "pointer",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <div>
                  <span style={{ fontWeight: "bold" }}>
                    {consent.analytics ? "✓" : "☐"} ᴀɴᴀʟʏᴛɪᴄꜱ (Google Analytics)
                  </span>
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Helps us understand how visitors interact with our website.
                    📊
                  </span>
                </div>
              </label>
            </div>

            {/* Monitoring */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.monitoring}
                  disabled
                  style={{
                    marginTop: "2px",
                    marginRight: "12px",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <div>
                  <span style={{ fontWeight: "bold" }}>
                    ✓ ᴍᴏɴɪᴛᴏʀɪɴɢ (Required)
                  </span>
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Error tracking & performance monitoring (Sentry, Datadog).
                    Required for site functionality. 🐛
                  </span>
                </div>
              </label>
            </div>

            {/* Preferences */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "not-allowed",
                  opacity: 0.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.preferences}
                  disabled
                  style={{
                    marginTop: "2px",
                    marginRight: "12px",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <div>
                  <span style={{ fontWeight: "bold" }}>
                    ✓ ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ (Required)
                  </span>
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Remembers your settings and preferences. Required for site
                    functionality. ⚙️
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Button variant="primary" size="md" onClick={handleAcceptAll}>
            ✓ Accept All
          </Button>

          <Button variant="outline" size="md" onClick={handleRejectAll}>
            ✗ Reject All
          </Button>

          {showDetails ? (
            <Button
              variant="secondary"
              size="md"
              onClick={handleSavePreferences}
            >
              ⚙ Save Preferences
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowDetails(true)}
            >
              ⚙ Customize
            </Button>
          )}

          <span style={{ fontSize: "11px", opacity: 0.6, marginLeft: "auto" }}>
            ⋆.˚ ᡣ𐭩 .𖥔˚ cookies ⋆.˚✮🍪✮˚.⋆
          </span>
        </div>
      </div>
    </Box>
  );
}
