'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { VscMenu } from 'react-icons/vsc';

import { cn } from '@/lib/utils';

import { projects } from '@/data/projects';

import { Container } from '@/components/layout/container';
import { Introduction } from '@/components/templates/introduction';
import UnstyledLink from '@/components/ui/links/UnstyledLink';

interface NavItemProps {
  label: string;
  href: string;
  external?: boolean;
}

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
      <div className='flex flex-col items-center rounded-full bg-white bg-opacity-60 px-5 py-2 text-black shadow-2xl backdrop-blur-md xl:px-6 xl:py-3'>
        {navItems.map((item) => (
          <UnstyledLink
            key={item.label}
            href={item.href}
            className='hover:text-primary-600 active:text-primary-900 px-2 text-xl xl:px-3 xl:text-xl'
          >
            {item.label}
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
    </div>
  );

  return (
    <>
      <header className='z-50 md:sticky md:top-0'>
        <Container>
          <div className='mb-16 flex items-start justify-between gap-12 py-4 md:mb-24'>
            {/* Introduction */}
            <Introduction projects={projects} />
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
