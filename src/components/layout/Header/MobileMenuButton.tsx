import * as React from 'react';
import { VscMenu } from 'react-icons/vsc';

import { cn } from '@/lib/utils';

interface MenuButtonProps {
  setMobileMenuIsOpen: (open: (isOpen: boolean) => boolean) => void;
}

export const MobileMenuButton = ({ setMobileMenuIsOpen }: MenuButtonProps) => {
  return (
    <div className='z-[65] ml-auto xl:hidden'>
      <div className='flex flex-row gap-3'>
        <button
          className={cn(
            'navbar-burger',
            'text-dark flex items-center justify-center rounded-full bg-white bg-opacity-60 p-3 backdrop-blur-md transition duration-200',
            'hover:scale-95 hover:bg-black hover:bg-opacity-60 hover:text-white active:scale-75 active:bg-neutral-700'
          )}
          onClick={() => setMobileMenuIsOpen((open) => !open)}
          data-testid='navigationButton'
        >
          <VscMenu className='h-6 w-6 text-inherit' />
        </button>
      </div>
    </div>
  );
};
