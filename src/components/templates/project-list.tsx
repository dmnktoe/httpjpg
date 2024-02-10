import * as React from 'react';

import { Container } from '@/components/layout/container';
import { ProjectCard } from '@/components/templates/project-card';

import { Project } from '@/interfaces/Project';

export const ProjectList = ({ projects }: { projects: Project[] }) => {
  return (
    <section>
      <Container>
        <div className='z-40 flex flex-col gap-8 md:gap-32'>
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <ProjectCard project={project} />
              <div className='text-center'>*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</div>
            </React.Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
};
