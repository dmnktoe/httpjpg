import { useEffect, useState } from 'react';

export const useMobileMenu = () => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.toggle('overflow-hidden', mobileMenuIsOpen);
  }, [mobileMenuIsOpen]);

  useEffect(() => {
    const keyDownHandler = (event: {
      key: string;
      preventDefault: () => void;
    }) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileNavigation();
      }
    };

    const closeMobileNavigation = () => setMobileMenuIsOpen(false);

    window.addEventListener('orientationchange', closeMobileNavigation);
    window.addEventListener('resize', closeMobileNavigation);
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      window.removeEventListener('orientationchange', closeMobileNavigation);
      window.removeEventListener('resize', closeMobileNavigation);
    };
  }, [setMobileMenuIsOpen]);

  return { mobileMenuIsOpen, setMobileMenuIsOpen };
};
