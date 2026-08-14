"use client";

import { Box } from "../box/box";
import { Link } from "../link/link";
import { MiniPlayerSlot } from "../music-player/mini-player-slot";
import { SearchTrigger } from "../search-trigger/search-trigger";
import { ExpandableLinks } from "./expandable-links";
import { Favicon } from "./favicon";
import type { HeaderProps } from "./header";
import { WorkNavLink } from "./work-nav-link";

export function Navigation({
  nav,
  projectsWork = [],
  websitesWork = [],
  showSearch = false,
}: Omit<HeaderProps, "children">) {
  return (
    <Box css={{ position: "relative", display: { base: "none", lg: "flex" }, w: "full" }}>
      <Box
        css={{
          display: "flex",
          flexDirection: { base: "column", md: "row" },
          gap: { base: "4", lg: "8" },
          w: "full",
        }}
      >
        <Box
          css={{
            display: { base: "none", md: "block" },
            flexShrink: 0,
            w: { md: "24rem" },
          }}
        >
          <Box css={{ lineHeight: "snug" }}>
            <Box as="span" css={{ fontWeight: "bold" }}>
              ⇝HE𝓁𝓁O{" "}
              <Link
                href="/"
                css={{ color: "inherit", textDecoration: "underline", _hover: { opacity: 0.7 } }}
              >
                www.httpjpg.com
              </Link>
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
                  {item.isExternal && <Favicon href={item.href} />}
                  {item.name.toUpperCase()}
                </Link>
                &ensp;ꗃ&ensp;
              </span>
            ))}
            <Box as="span" css={{ textAlign: "justify" }}>
              —————— ꀭꉣꁅ! :))))) ･ﾟ⋆ 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))
              {showSearch && (
                <>
                  {" • "}
                  <SearchTrigger />
                </>
              )}
              <MiniPlayerSlot />
            </Box>
            <br />
            <Link
              href="/feed-xml_html"
              css={{
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              }}
            >
              ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics ˙✧˖°📷 ༘ ⋆｡˚
            </Link>
          </Box>
        </Box>

        <Box
          css={{
            display: { base: "none", lg: "block" },
            flex: { lg: "1 1 0" },
            minW: { lg: 0 },
            lineHeight: "snug",
          }}
        >
          <Box as="span" css={{ fontWeight: "bold" }}>
            ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
          </Box>
          <br />
          {projectsWork.length > 0 ? (
            <ExpandableLinks
              items={projectsWork}
              renderItem={(work) => <WorkNavLink key={work.id} work={work} variant="projects" />}
            />
          ) : (
            <Box as="span" css={{ opacity: 0.5, fontSize: "xs" }}>
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
            flex: { lg: "1 1 0" },
            minW: { lg: 0 },
            lineHeight: "snug",
          }}
        >
          <Box as="span" css={{ fontWeight: "bold" }}>
            ⇝ᵣₑcꫀₙₜ ℘ɑׁׅ֮ᧁׁꫀׁׅܻ꯱ׁׅ֒
          </Box>
          <br />
          {websitesWork.length > 0 ? (
            <ExpandableLinks
              items={websitesWork}
              renderItem={(work) => <WorkNavLink key={work.id} work={work} variant="websites" />}
            />
          ) : (
            <Box as="span" css={{ opacity: 0.5, fontSize: "xs" }}>
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
}

Navigation.displayName = "Navigation";
