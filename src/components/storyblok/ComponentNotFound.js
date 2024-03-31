import { Container } from '@/components/layout/Container';

const ComponentNotFound = ({ component: { blok } }) => (
  <Container width='container'>
    <div className='bg-pink-300 p-4'>
      <h4 className='text-black'>
        '{blok.component}' component is missing from the codebase.
      </h4>
      <p className='text-black'>Source blok UID: {blok._uid}</p>
    </div>
  </Container>
);

export default ComponentNotFound;
