const ComponentNotFound = ({ component: { blok } }) => (
  <div className='bg-red-600 text-white'>
    <h2 className='text-white'>
      {blok.component} component is missing from the codebase.
    </h2>
    <p className='text-white'>Source blok UID: {blok._uid}</p>
  </div>
);

export default ComponentNotFound;
