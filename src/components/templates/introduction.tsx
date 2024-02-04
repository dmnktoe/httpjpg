import * as React from 'react';

import { Container } from '@/components/layout/Container';
import UnstyledLink from '@/components/ui/links/UnstyledLink';

interface IntroductionProps {
  projects?: string[];
}

// eslint-disable-next-line no-empty-pattern
export const Introduction = ({}: IntroductionProps) => {
  return (
    <section className='top-navigation-height py-6 text-black md:py-12'>
      <Container>
        <div className='flex flex-col gap-8 text-xs font-normal tracking-tight md:flex-row md:gap-16 md:text-base xl:text-xl'>
          <div className='md:w-3/12'>
            <span className='font-bold'>⇝HE𝓁𝓁O</span>
            <br />
            <span className='text-justify'>
              As a web developer and designer, my work often results in
              cross-media solutions. I tend to mix the media's typical practices
              with cutting-edge digital processing techniques.
            </span>
          </div>
          <div className='md:w-6/12'>
            <span className='font-bold'>⇝TH1𝓃𝑔S</span>
            <br />
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2023_outlet-label-store-cgi-te3shay-mix
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2021_Typohacks_publication_project management
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2021_Goethestraße 069_free project_photography & creative
              direction
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2021_form Magazin rebrand_form_management and concept
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2018_Novak Table_Objekte Unserer Tage_furniture design
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2015_Takahashi Lounge Chair_Objekte Unserer Tage_furniture design
            </UnstyledLink>
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2014_Schulz Chair_OUT_Objekte Unserer Tage_furniture Design
            </UnstyledLink>
          </div>
          <div className='md:w-3/12'>
            <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
            <br />
            <UnstyledLink
              href='#'
              className='hover:text-primary-600 line-clamp-1 hover:underline'
            >
              2024_Duecker Sterilization Website_Marketing
            </UnstyledLink>
          </div>
        </div>
      </Container>
    </section>
  );
};
