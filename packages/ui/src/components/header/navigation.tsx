"use client";

import { formatYear } from "../../lib/format";
import { Box } from "../box/box";
import { Link } from "../link/link";
import { NavLink } from "../nav-link/nav-link";
import type { HeaderProps } from "./header";

export const Navigation = ({
  nav,
  personalWork = [],
  clientWork = [],
}: Omit<HeaderProps, "children">) => {
  return (
    <Box
      css={{
        position: "relative",
        w: "full",
        display: { base: "none", md: "flex" },
      }}
    >
      <Box
        css={{
          display: "flex",
          w: "full",
          flexDirection: { base: "column", md: "row" },
          gap: { base: "4", lg: "8" },
        }}
      >
        <Box
          css={{
            display: { base: "none", md: "block" },
            w: { md: "100%", lg: "33.333333%" },
          }}
        >
          <Box css={{ maxW: "24rem", lineHeight: "snug" }}>
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
          </Box>
        </Box>

        <Box
          css={{
            display: { base: "none", lg: "block" },
            w: { lg: "33.333333%" },
            lineHeight: "snug",
          }}
        >
          <Box as="span" css={{ fontWeight: "bold" }}>
            ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
          </Box>
          <br />
          {personalWork.length > 0 ? (
            <>
              {personalWork.map((work) => {
                const year = formatYear(work.date);
                const previewImage = work.imageUrl;
                return (
                  <NavLink
                    key={work.id}
                    variant="personal"
                    href={work.isExternal ? work.slug : `/work/${work.slug}`}
                    isExternal={work.isExternal}
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
              })}
              <Link
                href="/feed-xml_html"
                css={{
                  display: "block",
                  textDecoration: "none",
                  _hover: { textDecoration: "underline" },
                  py: "0.5",
                  px: "0.5",
                }}
              >
                ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics ˙✧˖°📷 ༘ ⋆｡˚
              </Link>
            </>
          ) : (
            <Box as="span" css={{ fontSize: "xs", opacity: 0.5 }}>
              ╭─────────────────╮
              <br />│ ∅ coming soon ∅ │
              <br />
              ╰─────────────────╯
            </Box>
          )}
        </Box>

        <Box
          css={{
            display: { base: "none", lg: "block" },
            w: { lg: "33.333333%" },
            lineHeight: "snug",
          }}
        >
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
  );
};

Navigation.displayName = "Navigation";
