"use client";

import { Box, Button } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { getConsent, hasConsent, setConsent } from "../consent";
import type { ConsentCategory, ConsentState } from "../types";
import { DEFAULT_CONSENT_STATE, EXTERNAL_VENDORS } from "../types";

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
  const [expandedCategories, setExpandedCategories] = useState<
    Set<ConsentCategory>
  >(new Set());
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
      media: true,
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

  const toggleCategoryExpansion = (category: ConsentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getCategoryVendors = (category: ConsentCategory) => {
    return Object.entries(EXTERNAL_VENDORS)
      .filter(([_, vendor]) => vendor.category === category)
      .map(([key, vendor]) => ({ key, ...vendor }));
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
        zIndex: 99999,
        backgroundColor: "white",
        color: "black",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        maxHeight: "90vh",
        overflowY: "auto",
        overflowX: "hidden",
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
            {/* Preferences */}
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
                  checked={consent.preferences}
                  disabled
                  style={{
                    marginTop: "2px",
                    marginRight: "12px",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      ✓ ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ (Required)
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion("preferences")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "0 4px",
                        opacity: 0.7,
                      }}
                    >
                      {expandedCategories.has("preferences") ? "▼" : "▶"}
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Remembers your settings and preferences. Required for site
                    functionality. ⚙️
                  </span>

                  {/* Vendor List */}
                  {expandedCategories.has("preferences") && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingLeft: "8px",
                        borderLeft: "2px solid #ddd",
                      }}
                    >
                      {getCategoryVendors("preferences").length > 0 ? (
                        getCategoryVendors("preferences").map((vendor) => (
                          <div
                            key={vendor.key}
                            style={{ marginBottom: "6px", fontSize: "11px" }}
                          >
                            <div style={{ fontWeight: "500" }}>
                              → {vendor.name}
                            </div>
                            <div style={{ opacity: 0.7, marginLeft: "8px" }}>
                              {vendor.description}
                              {vendor.privacyPolicy && (
                                <>
                                  {" "}
                                  <a
                                    href={vendor.privacyPolicy}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "underline" }}
                                  >
                                    Privacy Policy ↗
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ opacity: 0.6, fontSize: "11px" }}>
                          No external vendors in this category
                        </div>
                      )}
                    </div>
                  )}
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
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      ✓ ᴍᴏɴɪᴛᴏʀɪɴɢ (Required)
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion("monitoring")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "0 4px",
                        opacity: 0.7,
                      }}
                    >
                      {expandedCategories.has("monitoring") ? "▼" : "▶"}
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Error tracking & performance monitoring. Required for site
                    functionality. 🐛
                  </span>

                  {/* Vendor List */}
                  {expandedCategories.has("monitoring") && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingLeft: "8px",
                        borderLeft: "2px solid #ddd",
                      }}
                    >
                      {getCategoryVendors("monitoring").map((vendor) => (
                        <div
                          key={vendor.key}
                          style={{ marginBottom: "6px", fontSize: "11px" }}
                        >
                          <div style={{ fontWeight: "500" }}>
                            → {vendor.name}
                          </div>
                          <div style={{ opacity: 0.7, marginLeft: "8px" }}>
                            {vendor.description}
                            {vendor.privacyPolicy && (
                              <>
                                {" "}
                                <a
                                  href={vendor.privacyPolicy}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: "underline" }}
                                >
                                  Privacy Policy ↗
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>

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
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {consent.analytics ? "✓" : "☐"} ᴀɴᴀʟʏᴛɪᴄꜱ
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion("analytics")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "0 4px",
                      }}
                    >
                      {expandedCategories.has("analytics") ? "▼" : "▶"}
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Helps us understand how visitors interact with our website.
                    📊
                  </span>

                  {/* Vendor List */}
                  {expandedCategories.has("analytics") && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingLeft: "8px",
                        borderLeft: "2px solid #ddd",
                      }}
                    >
                      {getCategoryVendors("analytics").map((vendor) => (
                        <div
                          key={vendor.key}
                          style={{ marginBottom: "6px", fontSize: "11px" }}
                        >
                          <div style={{ fontWeight: "500" }}>
                            → {vendor.name}
                          </div>
                          <div style={{ opacity: 0.7, marginLeft: "8px" }}>
                            {vendor.description}
                            {vendor.privacyPolicy && (
                              <>
                                {" "}
                                <a
                                  href={vendor.privacyPolicy}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: "underline" }}
                                >
                                  Privacy Policy ↗
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Media & External Services */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.media}
                  onChange={() => toggleCategory("media")}
                  style={{
                    marginTop: "2px",
                    marginRight: "12px",
                    cursor: "pointer",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {consent.media ? "✓" : "☐"} ᴍᴇᴅɪᴀ & ᴇxᴛᴇʀɴᴀʟ ꜱᴇʀᴠɪᴄᴇꜱ
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion("media")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "0 4px",
                      }}
                    >
                      {expandedCategories.has("media") ? "▼" : "▶"}
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Load external content from video and audio platforms. 🎬🎵
                  </span>

                  {/* Vendor List */}
                  {expandedCategories.has("media") && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingLeft: "8px",
                        borderLeft: "2px solid #ddd",
                      }}
                    >
                      {getCategoryVendors("media").map((vendor) => (
                        <div
                          key={vendor.key}
                          style={{ marginBottom: "6px", fontSize: "11px" }}
                        >
                          <div style={{ fontWeight: "500" }}>
                            → {vendor.name}
                          </div>
                          <div style={{ opacity: 0.7, marginLeft: "8px" }}>
                            {vendor.description}
                            {vendor.privacyPolicy && (
                              <>
                                {" "}
                                <a
                                  href={vendor.privacyPolicy}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ textDecoration: "underline" }}
                                >
                                  Privacy Policy ↗
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          <Button
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
            css={{
              md: {
                fontSize: "md",
                paddingX: "7",
                paddingY: "3",
                minHeight: "11",
              },
            }}
          >
            ✓ Accept All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectAll}
            css={{
              md: {
                fontSize: "md",
                paddingX: "7",
                paddingY: "3",
                minHeight: "11",
              },
            }}
          >
            ✗ Reject All
          </Button>

          {showDetails ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSavePreferences}
              css={{
                md: {
                  fontSize: "md",
                  paddingX: "7",
                  paddingY: "3",
                  minHeight: "11",
                },
              }}
            >
              ⚙ Save Preferences
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              css={{
                md: {
                  fontSize: "md",
                  paddingX: "7",
                  paddingY: "3",
                  minHeight: "11",
                },
              }}
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
