import * as React from 'react';

import { HeaderProps } from '@/components/layout/Header/Header';
import { Divider } from '@/components/ui/Divider';
import UnstyledLink from '@/components/ui/Links/UnstyledLink';

export const MobileMenuContent = ({ data }: HeaderProps) => {
  return (
    <div className='pointer-events-auto flex flex-grow flex-col items-stretch bg-white text-black md:m-6 md:rounded-2xl md:bg-white md:shadow-xl'>
      <div className='flex flex-1 flex-grow flex-col p-2 text-2xl tracking-tight md:p-6'>
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
            className='hover:underline'
          >
            {item.name}
          </UnstyledLink>
        ))}
        <Divider className='py-16' />
        {data.personal.map((work) => (
          <UnstyledLink
            key={work.uuid as string}
            href={`/work/${work.slug}`}
            className='line-clamp-1 hover:underline'
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <>{work.content?.title}</>
          </UnstyledLink>
        ))}
      </div>
    </div>
  );
};
