'use client';

import Image from 'next/image';
import * as React from 'react';
import { useCallback, useRef } from 'react';
/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { Container } from '@/components/layout/container';
import { Introduction } from '@/components/templates/introduction';
import { ProjectList } from '@/components/templates/project-list';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  const swiperElRef = useRef<SwiperRef>(null);

  const handlePrev = useCallback(() => {
    if (!swiperElRef.current) return;
    swiperElRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!swiperElRef.current) return;
    swiperElRef.current.swiper.slideNext();
  }, []);
  return (
    <main>
      <Introduction projects={[]} />
      <ProjectList projects={[]} />
      <section>
        <Container>
          <div className='z-40 flex flex-col gap-8 md:gap-16'>
            <div className='flex flex-col gap-2'>
              <div className='-mx-2 md:mx-0 xl:px-48'>
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1}
                  modules={[Navigation, Autoplay]}
                  ref={swiperElRef}
                  speed={1}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                >
                  <SwiperSlide>
                    <Image
                      src='/images/store-bild.png'
                      className='w-full'
                      alt='store'
                      width={1920}
                      height={900}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Image
                      src='/images/store2.png'
                      className='w-full'
                      alt='store2'
                      width={1920}
                      height={900}
                    />
                  </SwiperSlide>
                  <div className='absolute right-8 top-8 z-20'>
                    <div className='flex flex-row gap-3'>
                      <button onClick={handlePrev}>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 32 32'
                          className='w-16 -rotate-90'
                          fill='#ffffff'
                        >
                          <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
                        </svg>
                      </button>
                      <button onClick={handleNext}>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 32 32'
                          className='w-16 rotate-90'
                          fill='#ffffff'
                        >
                          <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Swiper>
              </div>
              <div>
                <div className='flex flex-row gap-2'>
                  <div className='w-1/2 text-[6.5vw] leading-[0.8] tracking-tighter'>
                    <div className='inline-block'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 32 32'
                        className='w-[5vw] rotate-90'
                        fill='#000000'
                      >
                        <path d='m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z' />
                      </svg>
                    </div>
                    Outlet L𝒶bel Store CGI—te3s𝒽a𝓎 MIX
                  </div>
                  <div className='w-1/2 text-xs tracking-tighter'>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Duis
                    autem vel eum iriure dolor in hendrerit in vulputate velit
                    esse molestie consequat, vel illum dolore eu feugiat nulla
                    facilisis at vero eros et accumsan et iusto odio dignissim
                    qui blandit praesent luptatum zzril delenit augue duis
                    dolore te feugait nulla facilisi. Lorem ipsum dolor sit
                    amet, consectetuer adipiscing elit, sed diam nonummy nibh
                    euismod tincidunt ut laoreet dolore magna aliquam erat
                    volutpat.
                    <p className='text-[9px] tracking-tighter text-neutral-400'>
                      Fotos: Dominik Müller
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='xl:px-64'>
                <Swiper spaceBetween={50} slidesPerView={1}>
                  <SwiperSlide>
                    <video
                      src='images/film.mp4'
                      autoPlay
                      loop
                      muted
                      className='w-full'
                    />
                    <div className='absolute right-8 top-8'></div>
                  </SwiperSlide>
                  <SwiperSlide>Slide 2</SwiperSlide>
                  <SwiperSlide>Slide 3</SwiperSlide>
                  <SwiperSlide>Slide 4</SwiperSlide>
                </Swiper>
              </div>
              <div>
                <div className='flex flex-row gap-2'>
                  <div className='w-1/2 text-[6.5vw] leading-[0.8] tracking-tighter'>
                    SaaS: TimeCurve Easy Time-Tracking
                  </div>
                  <div className='w-1/2 text-xs tracking-tighter'>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Duis
                    autem vel eum iriure dolor in hendrerit in vulputate velit
                    esse molestie consequat, vel illum dolore eu feugiat nulla
                    facilisis at vero eros et accumsan et iusto odio dignissim
                    qui blandit praesent luptatum zzril delenit augue duis
                    dolore te feugait nulla facilisi. Lorem ipsum dolor sit
                    amet, consectetuer adipiscing elit, sed diam nonummy nibh
                    euismod tincidunt ut laoreet dolore magna aliquam erat
                    volutpat.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
