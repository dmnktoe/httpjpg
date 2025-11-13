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
        display: { base: "none", xl: "flex" },
      }}
    >
      <Box
        css={{
          display: "flex",
          w: "full",
          flexDirection: { base: "column", md: "row" },
          gap: { base: "4", xl: "8" },
        }}
      >
        {/* Left Column - Main ASCII Navigation */}
        <Box
          css={{
            display: { base: "none", xl: "block" },
            w: { xl: "33.333333%" },
          }}
        >
          <Box css={{ maxW: "28rem" }}>
            <span style={{ fontWeight: "bold" }}>⇝HE𝓁𝓁O www.httpjpg.com</span>
            <br />
            <span style={{ textAlign: "justify" }}>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ——— ꠹ρᧁ! :))))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘ &&& ——— յׁׅ℘ᧁׁ!
              <br /> :))))) ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ————P̵̨̢͇̗̘̩̖̜̰̠͛̓Ĺ̴͙̝͎̼̌̒̓̌̀͊̎̔̍̉͛̋̔͝E̴̢̢̛̦̣̩̝̩͙̲̠͊̒̀̊̾̕͝Ä̴́̔̈̌͌̑ͅS̶̡̰̪̭͕̤̥͈̗̞͛́̍̾̑͜͜͝Ę̶̧̛̲̠̱̜̖͈̋͒̑̋̇̐̈́̓͊̃̈̕ ̸̡̛̣̹̠͖͊̓̊̒̅͗̏͌͑̐̚̕Y̴͎̘̙͓͕̺͒̽̃͛̂̓̊̎̕̚̚Ǫ̴̛̼̻̌̊͊̉͆́͋̔̀͒Ü̷̟̤͙̲̙̹̘̝̟̯̤̍̌͋͗̋͛̓̋̎̓̔̀͌S̸̩͔̿̒̔͗͘̚͝E̵̡̺̘̞̗͉̬̞̟͖͍̍͌ ̷̪͔̲̯̫̉̅͒̀͑͂̍͠T̷̯̹́͒̅̉̊̅̈́͠H̷͎̣̦̘̪͆͐́͝E̷͈͕̗̬̠̹͔͚̪͔̐
              <br />
              ̵͖̥̥͔͚̭̗̪̠͕̭̞̤̯̞̀̌͋́͒͠͝N̸̼̪̘̘̩͍̗͓̼͇̪͓̲̈̓̆͑͛̽͆̽͘A̵̧̪̱͖̦̭̎̓̓̾̌̓̎͠͝ͅW̴̙͑̑̈̕̚͝I̷̥͓̱̺̟͔̳̔̒̇͜͜Ģ̶͔̠̣̯̱̼̀̈́À̷͚̋̏͘͘͠T̴̨̰̭̓͋̔̀̓͊̄͐̇̇͒͐̓́͝I̵̡͓̖̼̒̈́͌̇͜Z̶̬̦̟̥͇͍̦͉̰̬͗͗̌̍̿̔̽͗̑̇͋̑͠͝͝O̴͖͇͈̾ͅN̷̝̺̺͎̻̟̞͓̳̠̎͜ͅ—— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ&nbsp;
            </span>
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
            <span style={{ textAlign: "justify" }}>
              —————— ꀭꉣꁅ! :))))) ･ﾟ⋆
              <br /> 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))) 🎀 ⋆ﾟ･
            </span>
          </Box>
        </Box>

        {/* Middle Column - Recent Personal Work */}
        <Box css={{ w: { xl: "33.333333%" } }}>
          <span style={{ fontWeight: "bold" }}>⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S</span>
          <br />
          {personalWork.length > 0 ? (
            <>
              {personalWork.map((work) => (
                <NavLink
                  key={work.id}
                  variant="personal"
                  href={`/work/${work.slug}`}
                >
                  {work.title}
                </NavLink>
              ))}
              <NavLink variant="personal" href="/feed">
                music ⋆.˚✮🎧✮˚.⋆ &nd pics ˙✧˖°📷 ༘ ⋆｡˚
              </NavLink>
            </>
          ) : (
            <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>
              ╭─────────────────╮
              <br />│ ∅ coming soon ∅ │
              <br />
              ╰─────────────────╯
            </span>
          )}
        </Box>

        {/* Right Column - Recent Client Work */}
        <Box css={{ w: { xl: "33.333333%" } }}>
          <span style={{ fontWeight: "bold" }}>⇝ᵣₑcꫀₙₜ 𝒞𝓁LI€NT</span>
          <br />
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
                >
                  {work.title}
                </NavLink>
              );
            })
          ) : (
            <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>
              ╭───────────────────╮
              <br />│ ⊹ taking clients ⊹ │
              <br />
              ╰───────────────────╯
            </span>
          )}
        </Box>
      </Box>
    </Box>
  );
};

Navigation.displayName = "Navigation";
