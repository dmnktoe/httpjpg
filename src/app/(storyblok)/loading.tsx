import DynamicLoad from 'next/dynamic';
import { Container } from 'src/components/layout/Container';

import { Flexbox } from '@/components/layout/flexbox';
const Skeleton = DynamicLoad(() => import('react-loading-skeleton'), {
  ssr: false,
});

const Loading = () => {
  return (
    <div className='bg-black'>
      <main>
        <Container width='container' className='my-10'>
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
