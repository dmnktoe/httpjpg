import * as React from 'react';

import { HeaderProps } from '@/components/layout/Header/Header';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

export const MobileMenuContent = ({ data }: HeaderProps) => {
  return (
    <div className='flex flex-grow flex-col items-stretch bg-[#EBE8E8] md:m-6 md:rounded-2xl md:bg-white md:shadow-xl'>
      <div className='flex flex-1 flex-grow flex-col gap-y-2 p-2 text-3xl tracking-tight md:p-6'>
        {data.nav.map((item) => (
          <UnstyledLink
            key={item._uid}
            href={
              item.isExternal
                ? item.link.cached_url
                : item.link.cached_url === 'home'
                ? '/'
                : `/${item.link.cached_url}`
            }
            className='hover:text-primary-600 active:text-primary-900'
          >
            {item.name}
          </UnstyledLink>
        ))}
      </div>
    </div>
  );
};
