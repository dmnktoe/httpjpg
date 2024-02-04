'use client';

import Image from 'next/image';
import React from 'react';

import { Container } from '@/components/layout/Container';

export default function StoriesPage() {
  return (
    <main>
      <section>
        <Container className='py-16'>
          <div className='grid grid-cols-6 grid-rows-5 gap-4'>
            <div className='col-span-6 row-span-1 md:col-span-2'>
              <div className='text-xs'>
                The form International Issue was a project close to our hearts.
                Nina Sieverding and I wanted to make the diverse content from
                the German form magazine accessible to a wider audience.
                Together with Autostrada Studio, we developed a graphical book
                concept in the form of a portable archive featuring 35
                contributions from recent years.Besides that, I was responsible
                for its financing and marketing.
              </div>
            </div>
            <div className='col-span-3 col-start-1 row-span-4 md:col-span-2 md:col-start-3 md:row-span-5'>
              <Image
                width='800'
                height='800'
                alt='test'
                className='w-full'
                src='https://s3-alpha-sig.figma.com/img/63d2/6931/57e93707bb30ba95bd26b5efd2ba2a53?Expires=1707696000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=cgZOE-W9HYaxzkd1tIe6C8jYZOkCcrchSUQiuFCp~iOM9ILf2zhB6E7knd9cYJ6yX5s4483iuMNy1A~6r0UcqKCBQ19nrZiw-dOefD5SCTTpAjOxWJUQem5eFT39xPftOlrNNxICxd6l0dh3fHMj~LLBmviVWmjvbHfc6LYz0T~mxlFS-Qllizn1do2awQUunl-q4EEl92OU-fjvjwjnef8LdL-79WxHrene3CTaNUNPZLTjBhsGUpWFw~CeXXlsHCAo25G2fG~YWq5EhgN3GwFTgaxIg1B-CuRFLMVs2ymsY5A6CRCRuaCFfkk-pNZwRnbZ8Bv9VimD9V3obvXYPA__'
              />
            </div>
            <div className='col-span-3 col-start-4 row-span-4 md:col-span-2 md:col-start-5 md:row-span-5'>
              <Image
                width='800'
                height='800'
                alt='test'
                className='aspect-auto w-full'
                src='https://s3-alpha-sig.figma.com/img/c4a3/0553/d6a90ef6d274b6a0178703dd849a113e?Expires=1707696000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Fw94B3Nclu0cbpPsopHO3nUaDcKOhet9bKtzyoSbuJMNA7mW4759VqteIWI6w8B9cwePposdGtf0XyqvP7ODrsCTMQ03dt5FNmNeL1Js9CWghZSO2NIljOFcZejHcCTXNEo0uer00wKyVUsb-IolCDXsHXnxpNGOU9WWykyuFnFHaUoeRJ2kHwTsGDOoMPgJDEiE6bbqBbmCXJNFFUIVfvnqIFFECJuA8M2tkp5Phj1dAvrPYf-rz3Y9KB4jx9JiXrckm206-xR3GZMj4wN1bOh8-mTaV7ZBgMpAF2kdQ~k8nIThr0yPg~jsgNNtKmPOfn1aX1CZKg8sXkGG68jL2g__'
              />
            </div>
          </div>
        </Container>
        <div className='relative px-44 py-80'>
          <div className='flex gap-4'>
            <div className='w-1/2'>
              <Image
                alt='test'
                className='w-full'
                src='https://placehold.co/780x1040'
                width={780}
                height={1040}
              />
              <Image
                alt='test'
                className='absolute bottom-0 right-64 w-[40vw]'
                src='https://placehold.co/780x1040'
                width={780}
                height={1040}
              />
            </div>
            <div className='w-1/2'>
              <div className='text-xs'>
                The form International Issue was a project close to our hearts.
                Nina Sieverding and I wanted to make the diverse content from
                the German form magazine accessible to a wider audience.
                Together with Autostrada Studio, we developed a graphical book
                concept in the form of a portable archive featuring 35
                contributions from recent years.Besides that, I was responsible
                for its financing and marketing.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
