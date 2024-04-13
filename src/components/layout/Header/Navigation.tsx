import * as React from 'react';

import { HeaderProps } from '@/components/layout/Header/Header';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

export const Navigation = ({ data }: HeaderProps) => {
  return (
    <div className='relative w-full xl:flex'>
      <div className='flex w-full flex-col gap-4 md:flex-row xl:gap-8'>
        <div className='hidden xl:block xl:w-1/3'>
          <div className='max-w-sm'>
            <span className='font-bold'>⇝HE𝓁𝓁O www.httpjpg.com</span>
            <br />
            <span className='text-justify'>
              ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ——— ꠹ρᧁ! :))))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘
              &&& ——— յׁׅ℘ᧁׁ!
              <br /> :))))) ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ————P̵̨̢͇̗̘̩̖̜̰̠͛̓Ĺ̴͙̝͎̼̌̒̓̌̀͊̎̔̍̉͛̋̔͝E̴̢̢̛̦̣̩̝̩͙̲̠͊̒̀̊̾̕͝Ä̴́̔̈̌͌̑ͅS̶̡̰̪̭͕̤̥͈̗̞͛́̍̾̑͜͜͝Ę̶̧̛̲̠̱̜̖͈̋͒̑̋̇̐̈́̓͊̃̈̕ ̸̡̛̣̹̠͖͊̓̊̒̅͗̏͌͑̐̚̕Y̴͎̘̙͓͕̺͒̽̃͛̂̓̊̎̕̚̚Ǫ̴̛̼̻̌̊͊̉͆́͋̔̀͒Ü̷̟̤͙̲̙̹̘̝̟̯̤̍̌͋͗̋͛̓̋̎̓̔̀͌S̸̩͔̿̒̔͗͘̚͝E̵̡̺̘̞̗͉̬̞̟͖͍̍͌ ̷̪͔̲̯̫̉̅͒̀͑͂̍͠T̷̯̹́͒̅̉̊̅̈́͠H̷͎̣̦̘̪͆͐́͝E̷͈͕̗̬̠̹͔͚̪͔̐
              <br />
              ̵͖̥̥͔͚̭̗̪̠͕̭̞̤̯̞̀̌͋́͒͠͝N̸̼̪̘̘̩͍̗͓̼͇̪͓̲̈̓̆͑͛̽͆̽͘A̵̧̪̱͖̦̭̎̓̓̾̌̓̎͠͝ͅW̴̙͑̑̈̕̚͝I̷̥͓̱̺̟͔̳̔̒̇͜͜Ģ̶͔̠̣̯̱̼̀̈́À̷͚̋̏͘͘͠T̴̨̰̭̓͋̔̀̓͊̄͐̇̇͒͐̓́͝I̵̡͓̖̼̒̈́͌̇͜Z̶̬̦̟̥͇͍̦͉̰̬͗͗̌̍̿̔̽͗̑̇͋̑͠͝͝O̴͖͇͈̾ͅN̷̝̺̺͎̻̟̞͓̳̠̎͜ͅ—— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ&nbsp;
            </span>
            {data.nav.map((item) => (
              <React.Fragment key={item.name}>
                🎀 ⋆ﾟ･
                <UnstyledLink
                  href={
                    item.isExternal
                      ? item.link.cached_url
                      : item.link.cached_url === 'home'
                      ? '/'
                      : `/${item.link.cached_url}`
                  }
                  className='font-accent hover:underline'
                >
                  {item.name.toUpperCase()}
                </UnstyledLink>
                &ensp;ꗃ&ensp;
              </React.Fragment>
            ))}
            <span className='text-justify'>
              —————— ꀭꉣꁅ! :))))) ･ﾟ⋆
              <br /> 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))) 🎀 ⋆ﾟ･
            </span>
          </div>
        </div>
        <div className='xl:w-1/3'>
          <span className='font-bold'>⇝TH1𝓃𝑔S</span>
          <br />
          {data.personal.map((work) => (
            <UnstyledLink
              key={work.uuid as string}
              href={`/work/${work.slug}`}
              className='line-clamp-1 hover:underline'
            >
              <>🎀 ⋆ﾟ･ {work.slug}</>
            </UnstyledLink>
          ))}
          <UnstyledLink
            href='/feed-xml'
            className='line-clamp-1 hover:underline'
          >
            ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics ˙✧˖°📷 ༘ ⋆｡˚ ➔
          </UnstyledLink>
        </div>
        <div className='xl:w-1/3'>
          <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
          <br />
          {data.client.map((work) => (
            <UnstyledLink
              key={work.uuid as string}
              href={`/work/${work.slug}`}
              className='line-clamp-1 hover:underline'
            >
              <>(^‿^)-𝒷)))){work.slug}</>
            </UnstyledLink>
          ))}
        </div>
      </div>
    </div>
  );
};
