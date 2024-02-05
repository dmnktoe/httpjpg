import * as React from 'react';

import UnstyledLink from '@/components/ui/links/UnstyledLink';

import { Project } from '@/interfaces/Project';

const Info = () => {
  return (
    <div>
      <span className='font-bold'>⇝HE𝓁𝓁O</span>
      <br />
      <span className='text-justify'>
        so I basically cook up web magic and design wizardry. My gig involves
        smashing together different media vibes and throwing in some spicy
        digital wizardry.
      </span>
    </div>
  );
};

const ProjectList = ({ projects }: { projects: Project[] }) => {
  return (
    <div>
      <span className='font-bold'>⇝TH1𝓃𝑔S</span>
      <br />
      {projects.map((project) => (
        <UnstyledLink
          key={project.id}
          href={`/projects/${project.slug}`}
          className='hover:text-primary-600 line-clamp-1 hover:underline'
        >
          {project.slug}
        </UnstyledLink>
      ))}
    </div>
  );
};

const ClientWorkList = ({ projects }: { projects: Project[] }) => {
  return (
    <div>
      <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
      <br />
      {projects.map((project) => (
        <UnstyledLink
          key={project.id}
          href={`/projects/${project.id}`}
          className='hover:text-primary-600 line-clamp-1 hover:underline'
        >
          {project.name}
        </UnstyledLink>
      ))}
    </div>
  );
};

// eslint-disable-next-line unused-imports/no-unused-vars
export const Introduction = ({ projects }: { projects: Project[] }) => {
  return (
    <div className='flex flex-col gap-4 text-xs font-light tracking-tight text-black md:flex-row xl:gap-16 xl:text-base'>
      <div className='md:w-3/12'>
        <Info />
      </div>
      <div className='md:w-6/12'>
        <ProjectList projects={projects} />
      </div>
      <div className='md:w-3/12'>
        <ClientWorkList projects={projects} />
      </div>
    </div>
  );
};
