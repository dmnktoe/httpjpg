"use client";

import { getProcessedImage } from "@httpjpg/storyblok-utils";
import { Box } from "../box/box";
import { Divider } from "../divider/divider";
import { Link } from "../link/link";
import { NavLink } from "../nav-link/nav-link";
import type { HeaderProps } from "./header";

interface MobileMenuContentProps extends Omit<HeaderProps, "children"> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Mobile Menu Overlay Content
 */
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
        zIndex: 50,
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
            bg: "white",
            color: "black",
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
              p: { base: "2", md: "6" },
              fontSize: { base: "lg", md: "xl" },
              overflowY: "auto",
              overflowX: "hidden",
              maxW: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              gap: { base: "1", md: "2" },
            }}
          >
            <Box
              css={{
                mb: { base: "2", md: "4" },
                fontWeight: "bold",
                fontSize: "sm",
                flexShrink: 0,
              }}
            >
              ╭─────────────────────╮
              <br />│ ⇝ MENU NAVIGATION │
              <br />
              ╰─────────────────────╯
            </Box>

            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                isExternal={item.isExternal}
                showExternalIcon={false}
                onClick={handleMenuItemClick}
                css={{
                  fontFamily: "accent",
                  textDecoration: "none",
                  color: "inherit",
                  flexShrink: 0,
                  _hover: { textDecoration: "underline" },
                }}
              >
                {item.name}
              </Link>
            ))}

            <Divider
              variant="ascii"
              pattern="⋆｡°✩ ･ ✦ ･ ✧ ･ ✦ ･ ✩°｡⋆"
              color="neutral.300"
              spacing="0"
              css={{
                textAlign: "left",
                justifyContent: "flex-start",
                flexShrink: 0,
                my: { base: "2", md: "3" },
              }}
            />

            <Box
              css={{
                fontFamily: "headline",
                mb: { base: "1", md: "2" },
                fontWeight: "bold",
                fontSize: "sm",
                letterSpacing: "wider",
                textTransform: "lowercase",
                flexShrink: 0,
              }}
            >
              Personal Work
            </Box>

            {personalWork.length > 0 ? (
              personalWork.map((work) => {
                // Optimize preview image to 200px thumbnail
                const previewImage = work.imageUrl
                  ? getProcessedImage(work.imageUrl, "200x0", "", "")
                  : undefined;
                return (
                  <NavLink
                    key={work.id}
                    variant="personal"
                    href={work.isExternal ? work.slug : `/work/${work.slug}`}
                    isExternal={work.isExternal}
                    onClick={handleMenuItemClick}
                    data-preview-image={previewImage}
                    css={{
                      fontSize: { base: "sm", md: "md" },
                      maxW: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {work.title}
                  </NavLink>
                );
              })
            ) : (
              <Box
                css={{ fontSize: "sm", opacity: 0.4, ml: "2", flexShrink: 0 }}
              >
                ∅ ɴᴏ ᴡᴏʀᴋ ʏᴇᴛ ⊹
              </Box>
            )}

            <Divider
              variant="ascii"
              pattern="⋆｡°✩ ･ ✦ ･ ✧ ･ ✦ ･ ✩°｡⋆"
              color="neutral.300"
              spacing="0"
              css={{
                textAlign: "left",
                justifyContent: "flex-start",
                flexShrink: 0,
                my: { base: "2", md: "3" },
              }}
            />

            <Box
              css={{
                fontFamily: "headline",
                mb: { base: "1", md: "2" },
                fontWeight: "bold",
                fontSize: "sm",
                letterSpacing: "wider",
                textTransform: "lowercase",
                flexShrink: 0,
              }}
            >
              Client Work
            </Box>

            {clientWork.length > 0 ? (
              clientWork.map((work) => {
                // Optimize preview image to 200px thumbnail
                const previewImage = work.imageUrl
                  ? getProcessedImage(work.imageUrl, "200x0", "", "")
                  : undefined;
                return (
                  <NavLink
                    key={work.id}
                    variant="client"
                    href={work.isExternal ? work.slug : `/work/${work.slug}`}
                    isExternal={work.isExternal}
                    onClick={handleMenuItemClick}
                    data-preview-image={previewImage}
                    css={{
                      fontSize: { base: "sm", md: "md" },
                      maxW: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {work.title}
                  </NavLink>
                );
              })
            ) : (
              <Box
                css={{ fontSize: "sm", opacity: 0.4, ml: "2", flexShrink: 0 }}
              >
                ⊹ ᴛᴀᴋɪɴɢ ᴄʟɪᴇɴᴛꜱ ⊹
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MobileMenuContent.displayName = "MobileMenuContent";
