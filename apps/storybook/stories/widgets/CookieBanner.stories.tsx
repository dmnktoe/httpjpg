import type { ConsentCategory, ConsentState } from "@httpjpg/consent";
import { CookieBanner, DEFAULT_CONSENT_STATE, EXTERNAL_VENDORS } from "@httpjpg/consent";
import { Box, Button } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { type MouseEvent, useState } from "react";

interface CookieCategoryVendor {
  key: string;
  name: string;
  description: string;
  privacyPolicy?: string;
}

function getCategoryVendors(category: ConsentCategory): CookieCategoryVendor[] {
  return Object.entries(EXTERNAL_VENDORS)
    .filter(([_, vendor]) => vendor.category === category)
    .map(([key, vendor]) => ({ key, ...vendor }));
}

function CategoryBlock({
  label,
  description,
  required = false,
  checked,
  expanded,
  vendors,
  emptyText,
  onToggle,
  onToggleExpansion,
}: {
  label: string;
  description: string;
  required?: boolean;
  checked: boolean;
  expanded: boolean;
  vendors: CookieCategoryVendor[];
  emptyText?: string;
  onToggle?: () => void;
  onToggleExpansion: () => void;
}) {
  return (
    <Box css={{ mb: "4" }}>
      <Box
        as="label"
        css={{
          display: "flex",
          alignItems: "flex-start",
          cursor: required ? "not-allowed" : "pointer",
          opacity: required ? 0.5 : 1,
        }}
      >
        <Box
          as="input"
          type="checkbox"
          checked={checked}
          disabled={required}
          onChange={onToggle}
          css={{
            mt: "0.5",
            mr: "3",
            w: "4",
            h: "4",
            cursor: required ? "not-allowed" : "pointer",
          }}
        />
        <Box css={{ flex: 1 }}>
          <Box css={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box as="span" css={{ fontWeight: "bold" }}>
              {checked ? "✓" : "☐"} {label}
              {required && " (Required)"}
            </Box>
            <Box
              as="button"
              type="button"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleExpansion();
              }}
              css={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "sm",
                px: "1",
                opacity: required ? 0.7 : 1,
              }}
            >
              {expanded ? "▼" : "▶"}
            </Box>
          </Box>
          <Box as="span" css={{ fontSize: "xs", opacity: 0.7 }}>
            {description}
          </Box>

          {expanded && (
            <Box css={{ mt: "2", pl: "2", borderLeft: "2px solid", borderColor: "pageBorder" }}>
              {vendors.length > 0
                ? vendors.map((vendor) => (
                    <Box key={vendor.key} css={{ mb: "1.5", fontSize: "xs" }}>
                      <Box css={{ fontWeight: 500 }}>→ {vendor.name}</Box>
                      <Box css={{ opacity: 0.7, ml: "2" }}>
                        {vendor.description}
                        {vendor.privacyPolicy && (
                          <>
                            {" "}
                            <Box
                              as="a"
                              href={vendor.privacyPolicy}
                              target="_blank"
                              rel="noopener noreferrer"
                              css={{ textDecoration: "underline" }}
                            >
                              Privacy Policy ↗
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))
                : emptyText && <Box css={{ opacity: 0.6, fontSize: "xs" }}>{emptyText}</Box>}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function CookieBannerVisual({
  showDetails: initialShowDetails = false,
}: {
  showDetails?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(initialShowDetails);
  const [expandedCategories, setExpandedCategories] = useState<Set<ConsentCategory>>(new Set());
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT_STATE);

  const toggleCategory = (category: keyof ConsentState) => {
    if (category === "monitoring" || category === "preferences") {
      return;
    }
    setConsent((prev) => ({ ...prev, [category]: !prev[category] }));
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

  return (
    <Box
      css={{
        position: "relative",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: "cookieBanner",
        bg: "pageBg",
        color: "pageFg",
        borderTop: "2px solid",
        borderTopColor: "primary.500",
        px: { base: "5", md: "10", lg: "16" },
        py: { base: "6", md: "8" },
        fontFamily: "sans",
        fontSize: "md",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        isolation: "isolate",
      }}
    >
      <Box css={{ maxW: "1400px", mx: "auto", lineHeight: 1.4 }}>
        <Box css={{ mb: "5" }}>
          <Box as="span" css={{ fontWeight: "bold", fontSize: "md", color: "primary.500" }}>
            ⇝🍪 ᴄᴏᴏᴋɪᴇ ᴘᴏʟɪᴄʏ 🍪⇝
          </Box>
          <br />
          <Box as="span" css={{ fontSize: "sm", opacity: 0.7 }}>
            ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ ꉔꆂꆂꀘꀤꏂꌚ &&& ——— 𝒸𝑜𝑜𝓀𝒾𝑒𝓈 𝒸𝑜𝑜𝓀𝒾𝑒𝓈 :)))))
          </Box>
        </Box>

        <Box css={{ mb: "4", fontSize: "sm" }}>
          <Box as="p" css={{ m: 0, mb: "2" }}>
            🎀 ⋆ﾟ･ We use cookies for analytics & monitoring. You can customize your preferences
            below. ⋆ﾟ･ 🎀
          </Box>
        </Box>

        {showDetails && (
          <Box
            css={{
              mb: "5",
              p: "4",
              border: "2px solid",
              borderColor: "pageFg",
              bg: "rgba(127,127,127,0.08)",
              fontSize: "sm",
            }}
          >
            <CategoryBlock
              label="ᴘʀᴇꜰᴇʀᴇɴᴄᴇꜱ"
              description="Remembers your settings and preferences. Required for site functionality. ⚙️"
              required
              checked={consent.preferences}
              expanded={expandedCategories.has("preferences")}
              vendors={getCategoryVendors("preferences")}
              emptyText="No external vendors in this category"
              onToggleExpansion={() => toggleCategoryExpansion("preferences")}
            />
            <CategoryBlock
              label="ᴍᴏɴɪᴛᴏʀɪɴɢ"
              description="Error tracking & performance monitoring. Required for site functionality. 🐛"
              required
              checked={consent.monitoring}
              expanded={expandedCategories.has("monitoring")}
              vendors={getCategoryVendors("monitoring")}
              onToggleExpansion={() => toggleCategoryExpansion("monitoring")}
            />
            <CategoryBlock
              label="ᴀɴᴀʟʏᴛɪᴄꜱ"
              description="Helps us understand how visitors interact with our website. 📊"
              checked={consent.analytics}
              expanded={expandedCategories.has("analytics")}
              vendors={getCategoryVendors("analytics")}
              onToggle={() => toggleCategory("analytics")}
              onToggleExpansion={() => toggleCategoryExpansion("analytics")}
            />
            <Box css={{ mb: 0 }}>
              <CategoryBlock
                label="ᴍᴇᴅɪᴀ & ᴇxᴛᴇʀɴᴀʟ ꜱᴇʀᴠɪᴄᴇꜱ"
                description="Load external content from video and audio platforms. 🎬🎵"
                checked={consent.media}
                expanded={expandedCategories.has("media")}
                vendors={getCategoryVendors("media")}
                onToggle={() => toggleCategory("media")}
                onToggleExpansion={() => toggleCategoryExpansion("media")}
              />
            </Box>
          </Box>
        )}

        <Box css={{ display: "flex", gap: "3", flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="primary"
            size="sm"
            css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
          >
            ✓ Accept All
          </Button>

          <Button
            variant="outline"
            size="sm"
            css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
          >
            ✗ Reject All
          </Button>

          {showDetails ? (
            <Button
              variant="secondary"
              size="sm"
              css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
            >
              ⚙ Save Preferences
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              css={{ md: { fontSize: "md", paddingX: "7", paddingY: "3", minHeight: "11" } }}
            >
              ⚙ Customize
            </Button>
          )}

          <Box as="span" css={{ fontSize: "xs", opacity: 0.6, ml: "auto" }}>
            ⋆.˚ ᡣ𐭩 .𖥔˚ cookies ⋆.˚✮🍪✮˚.⋆
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Cookie consent banner with brutalist styling.
 *
 * The banner shows at the bottom of the page and allows users to accept, reject,
 * or customize cookie preferences per category (analytics, monitoring, media, preferences).
 * Categories expand to show individual vendor details with privacy policy links.
 */
const meta = {
  title: "Widgets/CookieBanner",
  component: CookieBanner,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CookieBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default collapsed state — the banner as it first appears to visitors.
 */
export const Default: Story = {
  render: () => <CookieBannerVisual />,
};

/**
 * Expanded state showing all cookie categories with toggles and vendor details.
 */
export const WithDetails: Story = {
  render: () => <CookieBannerVisual showDetails />,
};

/**
 * Dark theme variant using the `data-theme="dark"` attribute.
 */
export const DarkTheme: Story = {
  render: () => (
    <div data-theme="dark" style={{ background: "#000", minHeight: "100vh" }}>
      <CookieBannerVisual showDetails />
    </div>
  ),
};
