"use client";

import { Box } from "../box/box";
import { Link } from "../link/link";
import { NavLink } from "../nav-link/nav-link";
import type { HeaderProps } from "./header";

/**
 * Desktop Navigation with ASCII Art Style
 */
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
        display: { base: "none", lg: "flex" },
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
        {/* Left Column - Main ASCII Navigation */}
        <Box
          css={{
            display: { base: "none", lg: "block" },
            w: { lg: "33.333333%" },
          }}
        >
          <Box css={{ maxW: "24rem", lineHeight: "snug" }}>
            <Box as="span" css={{ fontWeight: "bold" }}>
              ⇝HE𝓁𝓁O www.httpjpg.com
            </Box>
            <br />
            <Box as="span" css={{ textAlign: "justify" }}>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ——— ꠹ρᧁ! :))))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘ &&& ——— յׁׅ℘ᧁׁ!
              <br /> :))))) ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ————P̵̨̢͇̗̘̩̖̜̰̠͛̓Ĺ̴͙̝͎̼̌̒̓̌̀͊̎̔̍̉͛̋̔͝E̴̢̢̛̦̣̩̝̩͙̲̠͊̒̀̊̾̕͝Ä̴́̔̈̌͌̑ͅS̶̡̰̪̭͕̤̥͈̗̞͛́̍̾̑͜͜͝Ę̶̧̛̲̠̱̜̖͈̋͒̑̋̇̐̈́̓͊̃̈̕ ̸̡̛̣̹̠͖͊̓̊̒̅͗̏͌͑̐̚̕Y̴͎̘̙͓͕̺͒̽̃͛̂̓̊̎̕̚̚Ǫ̴̛̼̻̌̊͊̉͆́͋̔̀͒Ü̷̟̤͙̲̙̹̘̝̟̯̤̍̌͋͗̋͛̓̋̎̓̔̀͌S̸̩͔̿̒̔͗͘̚͝E̵̡̺̘̞̗͉̬̞̟͖͍̍͌ ̷̪͔̲̯̫̉̅͒̀͑͂̍͠T̷̯̹́͒̅̉̊̅̈́͠H̷͎̣̦̘̪͆͐́͝E̷͈͕̗̬̠̹͔͚̪͔̐
              <br />
              ̵͖̥̥͔͚̭̗̪̠͕̭̞̤̯̞̀̌͋́͒͠͝N̸̼̪̘̘̩͍̗͓̼͇̪͓̲̈̓̆͑͛̽͆̽͘A̵̧̪̱͖̦̭̎̓̓̾̌̓̎͠͝ͅW̴̙͑̑̈̕̚͝I̷̥͓̱̺̟͔̳̔̒̇͜͜Ģ̶͔̠̣̯̱̼̀̈́À̷͚̋̏͘͘͠T̴̨̰̭̓͋̔̀̓͊̄͐̇̇͒͐̓́͝I̵̡͓̖̼̒̈́͌̇͜Z̶̬̦̟̥͇͍̦͉̰̬͗͗̌̍̿̔̽͗̑̇͋̑͠͝͝O̴͖͇͈̾ͅN̷̝̺̺͎̻̟̞͓̳̠̎͜ͅ—— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ&nbsp;
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
              —————— ꀭꉣꁅ! :))))) ･ﾟ⋆
              <br /> 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))) 🎀 ⋆ﾟ･
            </Box>
          </Box>
        </Box>

        {/* Middle Column - Recent Personal Work */}
        <Box css={{ w: { lg: "33.333333%" }, lineHeight: "snug" }}>
          <Box as="span" css={{ fontWeight: "bold" }}>
            ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
          </Box>
          <br />
          {personalWork.length > 0 ? (
            <>
              {personalWork.map((work) => (
                <NavLink
                  key={work.id}
                  variant="personal"
                  href={work.isExternal ? work.slug : `/work/${work.slug}`}
                  isExternal={work.isExternal}
                  data-preview-image={work.imageUrl}
                  css={{
                    backgroundColor: work.isDraft ? "yellow" : "transparent",
                    color: work.isDraft ? "black" : "inherit",
                    padding: work.isDraft ? "0 4px" : "0",
                  }}
                >
                  {work.isDraft && "[DRAFT] "}
                  {work.title}
                </NavLink>
              ))}
              <Link
                href="/feed"
                css={{
                  display: "block",
                  textDecoration: "none",
                  _hover: { textDecoration: "underline" },
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

        {/* Right Column - Recent Client Work */}
        <Box css={{ w: { lg: "33.333333%" }, lineHeight: "snug" }}>
          <Box as="span" css={{ fontWeight: "bold" }}>
            ⇝ᵣₑcꫀₙₜ 𝒞𝓁LI€NT
          </Box>
          <br />
          {clientWork.length > 0 ? (
            clientWork.map((work) => {
              const href = work.isExternal ? work.slug : `/work/${work.slug}`;

              return (
                <NavLink
                  key={work.id}
                  variant="client"
                  href={href}
                  isExternal={work.isExternal}
                  showExternalIcon={work.isExternal}
                  data-preview-image={work.imageUrl}
                  css={{
                    backgroundColor: work.isDraft ? "yellow" : "transparent",
                    color: work.isDraft ? "black" : "inherit",
                    padding: work.isDraft ? "0 4px" : "0",
                  }}
                >
                  {work.isDraft && "[DRAFT] "}
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
