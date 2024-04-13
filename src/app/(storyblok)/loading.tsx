import { Container } from '@/components/layout/Container';

const Loading = () => {
  return (
    <main>
      <Container width='container'>
        <span className='animate-rainbow'>Loading...</span>
      </Container>
    </main>
  );
};

export default Loading;
