"use client";

import { formatYear } from "../../lib/format";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { NavLink } from "../nav-link/nav-link";
import type { HeaderProps } from "./header";

interface MobileMenuContentProps extends Omit<HeaderProps, "children"> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenuContent = ({
  isOpen,
  setIsOpen,
  nav,
  personalWork = [],
  clientWork = [],
}: MobileMenuContentProps) => {
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <Box
      css={{
        position: "fixed",
        inset: 0,
        zIndex: "mobileMenu",
        display: { base: "flex", xl: "none" },
        maxH: "full",
        w: "full",
        maxW: "full",
        flexDirection: "row",
        justifyContent: { md: "end" },
        transition: "all 200ms ease-in-out",
        visibility: isOpen ? "visible" : "hidden",
        opacity: isOpen ? 1 : 0,
      }}
      style={{
        backgroundColor: "rgba(235, 232, 232, 0.3)",
        backdropFilter: "blur(5px)",
      }}
    >
      <Box
        css={{
          m: 0,
          display: "flex",
          h: "100vh",
          maxH: "100vh",
          w: { base: "full", md: "96" },
          overflow: "hidden",
          transition: "all 200ms ease-in-out",
          transform: isOpen ? "translateX(0)" : "translateX(0.5rem)",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <Box
          css={{
            pointerEvents: "auto",
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "stretch",
            bg: "pageBg",
            color: "pageFg",
            m: { md: "6" },
            borderRadius: 0,
            position: "relative",
            overflow: "hidden",
            maxW: "100%",
            maxH: "100%",
          }}
        >
          <Box
            css={{
              display: "flex",
              flexDirection: "column",
              px: { base: "4", md: "6" },
              pt: { base: "20", md: "6" },
              pb: { base: "4", md: "6" },
              fontSize: "sm",
              lineHeight: "snug",
              overflowY: "auto",
              overflowX: "hidden",
              maxW: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              gap: "6",
            }}
          >
            <Box>
              <Box as="span" css={{ fontWeight: "bold" }}>
                ⇝HE𝓁𝓁O www.httpjpg.com
              </Box>
              <br />
              <Box as="span" css={{ textAlign: "justify" }}>
                ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ——— ꠹ρᧁ! :)))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘ &&& —— յׁׅ℘ᧁׁ!
              </Box>
              {nav.map((item) => (
                <span key={item.name}>
                  🎀 ⋆ﾟ･
                  <Link
                    href={item.href}
                    isExternal={item.isExternal}
                    showExternalIcon={false}
                    onClick={handleMenuItemClick}
                    css={{
                      fontFamily: "accent",
                      textDecoration: "none",
                      _hover: { textDecoration: "underline" },
                    }}
                  >
                    {item.name.toUpperCase()}
                  </Link>
                  &ensp;ꗃ&ensp;
                </span>
              ))}
              <Box as="span" css={{ textAlign: "justify" }}>
                —————— ꀭꉣꁅ! :))))) ･ﾟ⋆ 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))
              </Box>
              <br />
              <Link
                href="/feed-xml_html"
                onClick={handleMenuItemClick}
                css={{
                  textDecoration: "none",
                  _hover: { textDecoration: "underline" },
                }}
              >
                ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics ˙✧˖°📷 ༘ ⋆｡˚
              </Link>
            </Box>

            <Box>
              <Box as="span" css={{ fontWeight: "bold" }}>
                ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
              </Box>
              <br />
              {personalWork.length > 0 ? (
                personalWork.map((work) => {
                  const year = formatYear(work.date);
                  const previewImage = work.imageUrl;
                  return (
                    <NavLink
                      key={work.id}
                      variant="personal"
                      href={work.isExternal ? work.slug : `/work/${work.slug}`}
                      isExternal={work.isExternal}
                      onClick={handleMenuItemClick}
                      data-preview-image={previewImage}
                      css={{
                        backgroundColor: work.isDraft ? "warning.200" : "transparent",
                        color: work.isDraft ? "black" : "inherit",
                        ...(work.isDraft && { padding: "2px 4px" }),
                      }}
                    >
                      {work.isDraft && "[DRAFT] "}
                      {year && (
                        <Box as="span" css={{ fontStyle: "italic" }}>
                          {year}{" "}
                        </Box>
                      )}
                      {work.title}
                    </NavLink>
                  );
                })
              ) : (
                <Box as="span" css={{ fontSize: "xs", opacity: 0.5 }}>
                  ╭─────────────────╮
                  <br />│ ∅ coming soon ∅ │
                  <br />
                  ╰─────────────────╯
                </Box>
              )}
            </Box>

            <Box>
              <Box as="span" css={{ fontWeight: "bold" }}>
                ⇝ᵣₑcꫀₙₜ ℘ɑׁׅ֮ᧁׁꫀׁׅܻ꯱ׁׅ֒
              </Box>
              <br />
              {clientWork.length > 0 ? (
                clientWork.map((work) => {
                  const href = work.isExternal ? work.slug : `/work/${work.slug}`;
                  const year = formatYear(work.date);
                  const previewImage = work.imageUrl;
                  return (
                    <NavLink
                      key={work.id}
                      variant="client"
                      href={href}
                      isExternal={work.isExternal}
                      showExternalIcon={work.isExternal}
                      onClick={handleMenuItemClick}
                      data-preview-image={previewImage}
                      css={{
                        backgroundColor: work.isDraft ? "warning.200" : "transparent",
                        color: work.isDraft ? "black" : "inherit",
                        ...(work.isDraft && { padding: "0 4px" }),
                      }}
                    >
                      {work.isDraft && "[DRAFT] "}
                      {year && (
                        <Box as="span" css={{ fontStyle: "italic" }}>
                          {year}{" "}
                        </Box>
                      )}
                      {work.title}
                    </NavLink>
                  );
                })
              ) : (
                <Box as="span" css={{ fontSize: "xs", opacity: 0.5 }}>
                  ╭───────────────────╮
                  <br />│ ⊹ taking clients ⊹ │
                  <br />
                  ╰───────────────────╯
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MobileMenuContent.displayName = "MobileMenuContent";
