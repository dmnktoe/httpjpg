"use client";

import { Box } from "../box/box";
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
          h: "calc(100vh)",
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
            border: "3px solid black",
            borderRadius: 0,
            boxShadow: "8px 8px 0px 0px black",
          }}
        >
          <Box
            css={{
              display: "flex",
              flex: 1,
              flexGrow: 1,
              flexDirection: "column",
              p: { base: "2", md: "6" },
              fontSize: { base: "lg", md: "xl" },
            }}
          >
            <Box css={{ mb: "4", fontWeight: "bold", fontSize: "sm" }}>
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
                  _hover: { textDecoration: "underline" },
                }}
              >
                {item.name}
              </Link>
            ))}

            <Box
              css={{
                my: "3",
                fontSize: "xs",
                opacity: 0.6,
                fontFamily: "mono",
              }}
            >
              ╶─────────────────────╴
            </Box>

            <Box css={{ mb: "2", fontWeight: "bold", fontSize: "sm" }}>
              🎀 ୧ꔛꗃ˖ PERSONAL WORK
            </Box>

            {personalWork.length > 0 ? (
              personalWork.map((work) => (
                <NavLink
                  key={work.id}
                  variant="personal"
                  href={`/work/${work.slug}`}
                  onClick={handleMenuItemClick}
                  data-preview-image={work.imageUrl}
                  css={{
                    fontSize: { base: "sm", md: "md" },
                  }}
                >
                  {work.title}
                </NavLink>
              ))
            ) : (
              <Box css={{ fontSize: "xs", opacity: 0.4, ml: "2" }}>
                ∅ ɴᴏ ᴡᴏʀᴋ ʏᴇᴛ ⊹
              </Box>
            )}

            <Box
              css={{
                my: "3",
                fontSize: "xs",
                opacity: 0.6,
                fontFamily: "mono",
              }}
            >
              ╶─────────────────────╴
            </Box>

            <Box css={{ mb: "2", fontWeight: "bold", fontSize: "sm" }}>
              (^‿^)-𝒷))) CLIENT WORK
            </Box>

            {clientWork.length > 0 ? (
              clientWork.map((work) => {
                // Check if slug is external URL
                const isExternal =
                  work.slug.startsWith("http://") ||
                  work.slug.startsWith("https://");
                const href = isExternal ? work.slug : `/work/${work.slug}`;

                return (
                  <NavLink
                    key={work.id}
                    variant="client"
                    href={href}
                    isExternal={isExternal}
                    showExternalIcon={isExternal}
                    onClick={handleMenuItemClick}
                    data-preview-image={work.imageUrl}
                    css={{
                      fontSize: { base: "sm", md: "md" },
                    }}
                  >
                    {work.title}
                  </NavLink>
                );
              })
            ) : (
              <Box css={{ fontSize: "xs", opacity: 0.4, ml: "2" }}>
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
