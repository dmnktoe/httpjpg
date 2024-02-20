import DynamicLoad from 'next/dynamic';

import { Container } from '@/components/layout/container';
import { Flexbox } from '@/components/layout/flexbox';
import { Header } from '@/components/layout/header';
const Skeleton = DynamicLoad(() => import('react-loading-skeleton'), {
  ssr: false,
});

const Loading = () => {
  return (
    <div className='bg-black'>
      <Header />
      <main>
        <Container width='container' className='rs-my-10'>
          <Flexbox gap direction='row' wrap='wrap'>
            <Skeleton
              height={500}
              highlightColor='rgba(255,255,255,0.2)'
              baseColor='rgba(0,0,0,0.6)'
              containerClassName='w-full'
            />
            <Skeleton
              height={300}
              highlightColor='rgba(255,255,255,0.2)'
              baseColor='rgba(0,0,0,0.6)'
              containerClassName='w-full'
            />
          </Flexbox>
        </Container>
      </main>
    </div>
  );
};

export default Loading;
