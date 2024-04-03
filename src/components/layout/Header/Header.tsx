'use client';

import { SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { VscMenu } from 'react-icons/vsc';
import { Container } from 'src/components/layout/Container';

import { cn } from '@/lib/utils';

import UnstyledLink from '@/components/ui/Links/UnstyledLink';

interface HeaderProps {
  data: any;
  blok: SbBlokData;
}

export const Header = ({ data, blok }: HeaderProps) => {
  console.log(data.nav);

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.toggle('overflow-hidden', hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const keyDownHandler = (event: {
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeHamburgerNavigation();
      }
    };

    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);

    window.addEventListener('orientationchange', closeHamburgerNavigation);
    window.addEventListener('resize', closeHamburgerNavigation);
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      window.removeEventListener('orientationchange', closeHamburgerNavigation);
      window.removeEventListener('resize', closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  const Navigation = () => (
    <div className='relative hidden xl:flex'>
      <div className='flex flex-col gap-4 text-xs font-light tracking-tight md:flex-row xl:gap-16 xl:text-base'>
        <div className='md:w-4/12'>
          <span className='font-bold'>⇝HE𝓁𝓁O www.httpjpg.com</span>
          <br />
          <span className='text-justify'>
            ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& —————— ꠹ρᧁ! :))))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘
            &&& —————— յׁׅ℘ᧁׁ! :))))) ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ————P̵̨̢͇̗̘̩̖̜̰̠͛̓Ĺ̴͙̝͎̼̌̒̓̌̀͊̎̔̍̉͛̋̔͝E̴̢̢̛̦̣̩̝̩͙̲̠͊̒̀̊̾̕͝Ä̴́̔̈̌͌̑ͅS̶̡̰̪̭͕̤̥͈̗̞͛́̍̾̑͜͜͝Ę̶̧̛̲̠̱̜̖͈̋͒̑̋̇̐̈́̓͊̃̈̕ ̸̡̛̣̹̠͖͊̓̊̒̅͗̏͌͑̐̚̕Y̴͎̘̙͓͕̺͒̽̃͛̂̓̊̎̕̚̚Ǫ̴̛̼̻̌̊͊̉͆́͋̔̀͒Ü̷̟̤͙̲̙̹̘̝̟̯̤̍̌͋͗̋͛̓̋̎̓̔̀͌S̸̩͔̿̒̔͗͘̚͝E̵̡̺̘̞̗͉̬̞̟͖͍̍͌ ̷̪͔̲̯̫̉̅͒̀͑͂̍͠T̷̯̹́͒̅̉̊̅̈́͠H̷͎̣̦̘̪͆͐́͝E̷͈͕̗̬̠̹͔͚̪͔̐
            ̵͖̥̥͔͚̭̗̪̠͕̭̞̤̯̞̀̌͋́͒͠͝N̸̼̪̘̘̩͍̗͓̼͇̪͓̲̈̓̆͑͛̽͆̽͘A̵̧̪̱͖̦̭̎̓̓̾̌̓̎͠͝ͅW̴̙͑̑̈̕̚͝I̷̥͓̱̺̟͔̳̔̒̇͜͜Ģ̶͔̠̣̯̱̼̀̈́À̷͚̋̏͘͘͠T̴̨̰̭̓͋̔̀̓͊̄͐̇̇͒͐̓́͝I̵̡͓̖̼̒̈́͌̇͜Z̶̬̦̟̥͇͍̦͉̰̬͗͗̌̍̿̔̽͗̑̇͋̑͠͝͝O̴͖͇͈̾ͅN̷̝̺̺͎̻̟̞͓̳̠̎͜ͅ—— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ &&& —————— ꀭꉣꁅ!
            :))))) ･ﾟ⋆ 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))) 🎀 ⋆ﾟ･
          </span>
        </div>
        <div className='md:w-4/12'>
          <span className='font-bold'>⇝TH1𝓃𝑔S</span>
          <br />
          {data.personal.map((work) => (
            <UnstyledLink
              key={work.id}
              href={`/work/${work.slug}`}
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              🎀 ⋆ﾟ･
              {work.slug}
            </UnstyledLink>
          ))}
          <UnstyledLink href='/feed-xml'>
            ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics -----⇒
          </UnstyledLink>
        </div>
        <div className='md:w-4/12'>
          <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
          <br />
          {data.client.map((client) => (
            <UnstyledLink
              key={client.id}
              href={`${client.url}`}
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              (^‿^)-𝒷))))
              {client.slug}
            </UnstyledLink>
          ))}
        </div>
      </div>
      <div className='flex flex-col items-center rounded-full bg-white bg-opacity-60 px-5 py-2 text-black shadow-2xl backdrop-blur-md xl:px-6 xl:py-3'>
        {data.nav.map((item) => (
          <UnstyledLink
            key={item.name}
            href={
              item.link.cached_url === 'home' ? '/' : '/' + item.link.cached_url
            }
            className='hover:text-primary-600 active:text-primary-900 px-2 text-xl xl:px-3 xl:text-xl'
          >
            {item.name}
          </UnstyledLink>
        ))}
      </div>
    </div>
  );

  const MenuButton = () => (
    <div className='z-[65] ml-auto xl:hidden'>
      <div className='flex flex-row gap-3'>
        <button
          className={cn(
            'navbar-burger',
            'text-dark flex items-center justify-center rounded-full bg-white bg-opacity-60 p-3 backdrop-blur-md transition duration-200',
            'hover:scale-95 hover:bg-black hover:bg-opacity-60 hover:text-white active:scale-75 active:bg-neutral-700'
          )}
          onClick={() => setHamburgerMenuIsOpen((open) => !open)}
          data-testid='navigationButton'
        >
          <VscMenu className='h-6 w-6 text-inherit' />
        </button>
      </div>
    </div>
  );

  const MobileMenuContent = () => (
    <div className='flex flex-grow flex-col items-stretch bg-[#EBE8E8] md:m-6 md:rounded-2xl md:bg-white md:shadow-xl'>
      <div className='flex flex-1 flex-grow flex-col gap-y-2 p-2 text-3xl tracking-tight md:p-6'>
        {data.nav.map((item) => (
          <UnstyledLink
            key={item.name}
            href={item.link.cached_url}
            className='hover:text-primary-600 active:text-primary-900'
          >
            {item.name}
          </UnstyledLink>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <header className='z-50 md:sticky md:top-0' {...storyblokEditable(blok)}>
        <Container>
          <div className='mb-16 flex items-start justify-between gap-12 py-4 md:mb-24'>
            {/* Navigation */}
            <Navigation />
            {/* Hamburger Menu Button */}
            <MenuButton />
            {/* Absolute positioned mobile menu with blur-mask */}
            <div
              className={cn(
                'fixed inset-0 z-50 flex max-h-full w-full max-w-full flex-row transition-all duration-200 ease-in-out md:justify-end md:bg-[#EBE8E8]/30 md:backdrop-blur-[5px] xl:hidden',
                hamburgerMenuIsOpen
                  ? 'visible opacity-100'
                  : 'invisible opacity-0'
              )}
            >
              <div
                data-testid='navigationMenu'
                className={cn(
                  'animate-fadeInRight m-0 flex h-[calc(100vh)] w-full overflow-hidden transition-all duration-200 ease-in-out md:w-96',
                  hamburgerMenuIsOpen
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-2 opacity-0'
                )}
              >
                <MobileMenuContent />
              </div>
            </div>
          </div>
        </Container>
      </header>
    </>
  );
};
