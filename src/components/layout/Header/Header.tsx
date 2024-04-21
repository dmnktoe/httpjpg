'use client';

import { SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useMobileMenu } from '@/hooks/useMobileMenu';

import { Container } from '@/components/layout/Container';
import { MobileMenuButton } from '@/components/layout/Header/MobileMenuButton';
import { MobileMenuContent } from '@/components/layout/Header/MobileMenuContent';
import { Navigation } from '@/components/layout/Header/Navigation';

export interface HeaderProps {
  data: {
    nav: {
      _uid: string;
      link: {
        cached_url: string;
      };
      name: string;
      isExternal: boolean;
    }[];
    personal: SbBlokData[];
    client: SbBlokData[];
  };
  setMobileMenuIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header = ({ data }: HeaderProps) => {
  const { mobileMenuIsOpen, setMobileMenuIsOpen } = useMobileMenu();

  const mobileMenuClass = mobileMenuIsOpen
    ? 'visible opacity-100'
    : 'invisible opacity-0';
  const navigationMenuClass = mobileMenuIsOpen
    ? 'translate-x-0 opacity-100'
    : 'translate-x-2 opacity-0';

  return (
    <>
      <header {...storyblokEditable(data)}>
        <Container>
          <div className='flex w-full items-start justify-between gap-12 py-4 tracking-tight'>
            <Navigation data={data} />
            <MobileMenuButton setMobileMenuIsOpen={setMobileMenuIsOpen} />
            <div
              className={cn(
                'fixed inset-0 z-50 flex max-h-full w-full max-w-full flex-row transition-all duration-200 ease-in-out md:justify-end md:bg-[#EBE8E8]/30 md:backdrop-blur-[5px] xl:hidden',
                mobileMenuClass
              )}
            >
              <div
                data-testid='navigationMenu'
                className={cn(
                  'animate-fadeInRight m-0 flex h-[calc(100vh)] w-full overflow-hidden transition-all duration-200 ease-in-out md:w-96',
                  navigationMenuClass
                )}
              >
                <MobileMenuContent
                  data={data}
                  setMobileMenuIsOpen={setMobileMenuIsOpen}
                />
              </div>
            </div>
          </div>
        </Container>
      </header>
    </>
  );
};
