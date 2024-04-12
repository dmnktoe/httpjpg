import { Container } from '@/components/layout/Container';

const ComponentNotFound = ({ component: { blok } }) => (
  <Container width='container'>
    <div className='bg-pink-300 p-4 text-black'>
      <p className='font-bold'>
        »{blok.component}« component is missing from the codebase.
      </p>
      <p>Source Blok UID: {blok._uid}</p>
    </div>
  </Container>
);

export default ComponentNotFound;
