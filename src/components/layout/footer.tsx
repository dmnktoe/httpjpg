import { Container } from '@/components/layout/container';

import UnstyledLink from '../ui/links/UnstyledLink';

export const Footer = () => {
  return (
    <footer className='mt-44 bg-black text-xs text-white'>
      <Container>
        <div className='flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between md:py-12'>
          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
            <div className='flex flex-col gap-2'>
              <span className='font-bold'>⇝TH1𝓃𝑔S</span>
              <UnstyledLink href='/projects' className='hover:underline'>
                Projects
              </UnstyledLink>
              <UnstyledLink href='/about' className='hover:underline'>
                About
              </UnstyledLink>
              <UnstyledLink href='/contact' className='hover:underline'>
                Contact
              </UnstyledLink>
            </div>
            <div className='flex flex-col gap-2'>
              <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
              <UnstyledLink href='/projects' className='hover:underline'>
                Client Work
              </UnstyledLink>
              <UnstyledLink href='/services' className='hover:underline'>
                Services
              </UnstyledLink>
              <UnstyledLink href='/contact' className='hover:underline'>
                Hire Me
              </UnstyledLink>
            </div>
          </div>
          <div className='flex flex-col gap-4 md:flex-row md:gap-8'>
            <div className='flex flex-col gap-2'>
              <span className='font-bold'>⇝ℂ𝕠℞ℝ𝓔ℂ𝕋</span>
              <UnstyledLink href='/blog' className='hover:underline'>
                Blog
              </UnstyledLink>
              <UnstyledLink href='/contact' className='hover:underline'>
                Privacy Policy
              </UnstyledLink>
              <UnstyledLink href='/contact' className='hover:underline'>
                Terms of Service
              </UnstyledLink>
            </div>
            <div className='flex flex-col gap-2'>
              <span className='font-bold'>⇝𝒮𝓞ℂℐ𝒜𝓁</span>
              <UnstyledLink
                href='https://www.linkedin.com/in/username'
                className='hover:underline'
              >
                LinkedIn
              </UnstyledLink>
              <UnstyledLink
                href='https://www.github.com/username'
                className='hover:underline'
              >
                Github
              </UnstyledLink>
              <UnstyledLink
                href='https://www.twitter.com/username'
                className='hover:underline'
              >
                Twitter
              </UnstyledLink>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
