'use client';

import { ReactElement, useEffect, useState } from 'react';
import * as React from 'react';
import { VscMenu } from 'react-icons/vsc';

import { cn } from '@/lib/utils';

import { Container } from '@/components/layout/Container';
import ButtonLink from '@/components/ui/links/ButtonLink';
import UnstyledLink from '@/components/ui/links/UnstyledLink';

interface NavItemProps {
  label: string;
  href: string;
  external?: boolean;
}

const Logo = (): ReactElement => {
  return (
    <pre
      spellCheck='false'
      className={cn(
        'text-bold transform text-black transition-all',
        'hover:bg-primary-600 text-[5px] leading-[0.4] tracking-tighter hover:text-white md:text-[6px] lg:text-[7px] xl:text-[8px]'
      )}
    >
      hhhhhhh                     tttt              tttt                              jjjj<br />
      h:::::h                  ttt:::t           ttt:::t                             j::::j<br />
      h:::::h                  t:::::t           t:::::t                              jjjj<br />
      h:::::h                  t:::::t           t:::::t<br />
      h::::h hhhhh      ttttttt:::::ttttttttttttt:::::ttttttt   ppppp   ppppppppp  jjjjjjjppppp   ppppppppp      ggggggggg   ggggg<br />
      h::::hh:::::hhh   t:::::::::::::::::t:::::::::::::::::t   p::::ppp:::::::::p j:::::jp::::ppp:::::::::p    g:::::::::ggg::::g<br />
      h::::::::::::::hh t:::::::::::::::::t:::::::::::::::::t   p:::::::::::::::::p j::::jp:::::::::::::::::p  g:::::::::::::::::g<br />
      h:::::::hhh::::::htttttt:::::::ttttttttttt:::::::tttttt   pp::::::ppppp::::::pj::::jpp::::::ppppp::::::pg::::::ggggg::::::gg<br />
      h::::::h   h::::::h     t:::::t           t:::::t          p:::::p     p:::::pj::::j p:::::p     p:::::pg:::::g     g:::::g<br />
      h:::::h     h:::::h     t:::::t           t:::::t          p:::::p     p:::::pj::::j p:::::p     p:::::pg:::::g     g:::::g<br />
      h:::::h     h:::::h     t:::::t           t:::::t          p:::::p     p:::::pj::::j p:::::p     p:::::pg:::::g     g:::::g<br />
      h:::::h     h:::::h     t:::::t    tttttt t:::::t    ttttttp:::::p    p::::::pj::::j p:::::p    p::::::pg::::::g    g:::::g<br />
      h:::::h     h:::::h     t::::::tttt:::::t t::::::tttt:::::tp:::::ppppp:::::::pj::::j p:::::ppppp:::::::pg:::::::ggggg:::::g<br />
      h:::::h     h:::::h     tt::::::::::::::t tt::::::::::::::tp::::::::::::::::p j::::j p::::::::::::::::p  g::::::::::::::::g<br />
      h:::::h     h:::::h       tt:::::::::::tt   tt:::::::::::ttp::::::::::::::pp  j::::j p::::::::::::::pp    gg::::::::::::::g<br />
      hhhhhhh     hhhhhhh         ttttttttttt       ttttttttttt  p::::::pppppppp    j::::j p::::::pppppppp        gggggggg::::::g<br />
      p:::::p            j::::j p:::::p                        g:::::g<br />
      p:::::p  jjjj      j::::j p:::::p            gggggg      g:::::g<br />
      p:::::::pj::::jj   j:::::jp:::::::p           g:::::gg   gg:::::g<br />
      p:::::::pj::::::jjj::::::jp:::::::p            g::::::ggg:::::::g<br />
      p:::::::p jj::::::::::::j p:::::::p             gg:::::::::::::g<br />
      ppppppppp   jjj::::::jjj  ppppppppp               ggg::::::ggg<br />
      jjjjjj                                gggggg<br />
    </pre>
  );
};

export const Header = () => {
  const navItems: NavItemProps[] = [
    { label: 'Home', href: '/' },
    { label: 'Stories', href: '/stories' },
    { label: 'Contact', href: '/contact' },
    { label: 'Github', href: 'https://github.com/dmnktoe', external: true },
  ];

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
      <div
        className='inline-flex items-center justify-between rounded-full bg-white bg-opacity-60 px-5 py-2 backdrop-blur-md lg:px-6 lg:py-3'>
        {navItems.map((item) => (
          <UnstyledLink
            key={item.label}
            href={item.href}
            className='hover:text-primary-600 active:text-primary-900 px-2 text-xl text-black lg:px-3 lg:text-2xl'
          >
            {item.label}
          </UnstyledLink>
        ))}
      </div>
    </div>
  );

  const MobileMenuContent = () => (
    <div
      className='flex flex-grow flex-col items-stretch bg-[#EBE8E8] md:bg-white text-black md:m-6 md:rounded-2xl md:shadow-xl'>
      <div className='flex flex-1 flex-grow flex-col gap-y-2 p-2 md:p-6 text-3xl tracking-tight'>
        {navItems.map((item) => (
          <UnstyledLink
            key={item.label}
            href={item.href}
            className='hover:text-primary-600 active:text-primary-900'
          >
            {item.label}
          </UnstyledLink>
        ))}
      </div>
      <div className='text-md flex flex-col justify-between gap-y-2 p-6 font-medium tracking-tight'>
        <div className='mb-2 grid grid-cols-3 divide-x text-center'>
          <UnstyledLink href='/impressum'>imprint</UnstyledLink>
          <UnstyledLink href='/datenschutz'>privacy</UnstyledLink>
        </div>
        <ButtonLink
          href='/kontakt'
          size='base'
          className='ml-4'
          variant='outline'
        >
          call
        </ButtonLink>
      </div>
    </div>
  );

  return (
    <>
      <header className='z-50 md:sticky md:top-0'>
        <Container>
          <div className='h-navigation-height flex items-center justify-between py-4'>
            {/* Logo Section */}
            <UnstyledLink href='/'>
              <Logo />
            </UnstyledLink>
            {/* Navigation */}
            <Navigation />
            <div className='ml-auto xl:hidden'>
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
            {/* Absolute positioned mobile menu with blur-mask */}
            <div
              className={cn(
                'top-navigation-height fixed inset-0 z-50 flex max-h-full w-full max-w-full flex-row transition-all duration-200 ease-in-out md:justify-end md:bg-[#EBE8E8]/30 md:backdrop-blur-[5px] xl:hidden',
                hamburgerMenuIsOpen
                  ? 'visible opacity-100'
                  : 'invisible opacity-0'
              )}
            >
              <div
                data-testid='navigationMenu'
                className={cn(
                  'animate-fadeInRight m-0 flex h-[calc(100vh_-_var(--navigation-height))] w-full overflow-hidden transition-all duration-200 ease-in-out md:w-96',
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
