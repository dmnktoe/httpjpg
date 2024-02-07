import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-white bg-opacity-45'>
        <div className='layout flex min-h-44 flex-col items-center justify-center text-center text-black'>
          <h1 className='mt-8 text-4xl md:text-6xl'>
            💲🐧 ➃０❹ ᑎ𝓸𝐓 Ⓕ𝔬𝔲ภ𝔡 𝕩➂;( 👍🍫
          </h1>
          <a href='/'>HOME</a>
        </div>
      </section>
    </main>
  );
}
