"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const menu = (
    <Box
      css={{
        position: "fixed",
        inset: 0,
        zIndex: "mobileMenu",
        display: { base: "flex", xl: "none" },
        maxH: "100dvh",
        w: "full",
        maxW: "full",
        flexDirection: "row",
        justifyContent: { md: "end" },
        transition: `opacity 200ms ease-in-out, visibility 0s linear ${isOpen ? "0s" : "200ms"}`,
        visibility: isOpen ? "visible" : "hidden",
        opacity: isOpen ? 1 : 0,
      }}
      style={{
        backgroundColor: "rgba(235, 232, 232, 0.3)",
        backdropFilter: isOpen ? "blur(5px)" : "none",
      }}
    >
      <Box
        css={{
          m: 0,
          display: "flex",
          h: "100dvh",
          maxH: "100dvh",
          w: { base: "full", md: "96" },
          overflow: "hidden",
          transition: "opacity 200ms ease-in-out, transform 200ms ease-in-out",
          transform: {
            base: "translateX(0)",
            md: isOpen ? "translateX(0)" : "translateX(0.5rem)",
          },
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

  if (!mounted) {
    return null;
  }

  return createPortal(menu, document.body);
};

MobileMenuContent.displayName = "MobileMenuContent";
