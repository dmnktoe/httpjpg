import * as React from 'react';
import { VscMenu } from 'react-icons/vsc';

import { cn } from '@/lib/utils';

interface MenuButtonProps {
  setMobileMenuIsOpen: (open: (isOpen: boolean) => boolean) => void;
}

export const MobileMenuButton = ({ setMobileMenuIsOpen }: MenuButtonProps) => {
  return (
    <div className='fixed right-2 top-3 z-[65] ml-auto md:relative md:right-auto md:top-auto xl:hidden'>
      <div className='flex flex-row gap-3'>
        <button
          className={cn(
            'navbar-burger',
            'flex items-center justify-center rounded-full bg-black bg-opacity-75 p-3 text-white backdrop-blur-md transition duration-200',
            'hover:scale-95 hover:bg-black hover:text-white active:scale-75 active:bg-neutral-700',
          )}
          onClick={() => setMobileMenuIsOpen((open) => !open)}
          data-testid='navigationButton'
        >
          <VscMenu className='h-4 w-4 text-inherit' />
        </button>
      </div>
    </div>
  );
};
