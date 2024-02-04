import * as React from 'react';

import { Container } from '@/components/layout/container';
import Slideshow from '@/components/ui/slideshow';

import { Project } from '@/interfaces/Project';

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='-mx-2 md:mx-0 xl:px-48'>
        <Slideshow images={project.images} />
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
            {project.name}
          </div>
          <div className='w-1/2 text-xs tracking-tighter'>
            {project.description}
            <p className='text-[9px] tracking-tighter text-neutral-400'>
              Fotos: Dominik Müller
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectList = ({ projects }: { projects: Project[] }) => {
  return (
    <section>
      <Container>
        <div className='z-40 flex flex-col gap-8 md:gap-16'>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </section>
  );
};
