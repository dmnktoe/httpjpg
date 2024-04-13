import DynamicLoad from 'next/dynamic';

import { Container } from '@/components/layout/Container';
import { Flexbox } from '@/components/layout/Flexbox';
const Skeleton = DynamicLoad(() => import('react-loading-skeleton'), {
  ssr: false,
});

const Loading = () => {
  return (
    <main>
      <Container width='container'>
        <Flexbox gap direction='row'>
          <Skeleton
            height={200}
            highlightColor='rgba(255,255,255,0.2)'
            baseColor='rgba(0,0,0,0.1)'
            containerClassName='w-full'
          />
          <Skeleton
            height={200}
            highlightColor='rgba(255,255,255,0.2)'
            baseColor='rgba(0,0,0,0.1)'
            containerClassName='w-full'
          />
        </Flexbox>
      </Container>
    </main>
  );
};

export default Loading;
