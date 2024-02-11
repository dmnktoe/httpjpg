import * as React from 'react';

import { clients } from '@/data/clients';

import UnstyledLink from '@/components/ui/links/UnstyledLink';

import { Client } from '@/interfaces/Client';
import { Project } from '@/interfaces/Project';

const Info = () => {
  return (
    <div className='mb-6 xl:mb-0'>
      <span className='font-bold'>⇝HE𝓁𝓁O www.httpjpg.com</span>
      <br />
      <UnstyledLink href='/'>
        <span className='text-justify'>
          ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& —————— ꠹ρᧁ! :))))) hׁׅ֮υׁׅhׁׅ֮υׁׅυׁׅυׁׅ hׁׅ֮tׁׅtׁׅ℘
          &&& —————— յׁׅ℘ᧁׁ! :))))) ⋈ꮺ⋈ꮺꮺꮺ ⋈ᯅᯅꔛ &&& ————P̵̨̢͇̗̘̩̖̜̰̠͛̓Ĺ̴͙̝͎̼̌̒̓̌̀͊̎̔̍̉͛̋̔͝E̴̢̢̛̦̣̩̝̩͙̲̠͊̒̀̊̾̕͝Ä̴́̔̈̌͌̑ͅS̶̡̰̪̭͕̤̥͈̗̞͛́̍̾̑͜͜͝Ę̶̧̛̲̠̱̜̖͈̋͒̑̋̇̐̈́̓͊̃̈̕ ̸̡̛̣̹̠͖͊̓̊̒̅͗̏͌͑̐̚̕Y̴͎̘̙͓͕̺͒̽̃͛̂̓̊̎̕̚̚Ǫ̴̛̼̻̌̊͊̉͆́͋̔̀͒Ü̷̟̤͙̲̙̹̘̝̟̯̤̍̌͋͗̋͛̓̋̎̓̔̀͌S̸̩͔̿̒̔͗͘̚͝E̵̡̺̘̞̗͉̬̞̟͖͍̍͌ ̷̪͔̲̯̫̉̅͒̀͑͂̍͠T̷̯̹́͒̅̉̊̅̈́͠H̷͎̣̦̘̪͆͐́͝E̷͈͕̗̬̠̹͔͚̪͔̐
          ̵͖̥̥͔͚̭̗̪̠͕̭̞̤̯̞̀̌͋́͒͠͝N̸̼̪̘̘̩͍̗͓̼͇̪͓̲̈̓̆͑͛̽͆̽͘A̵̧̪̱͖̦̭̎̓̓̾̌̓̎͠͝ͅW̴̙͑̑̈̕̚͝I̷̥͓̱̺̟͔̳̔̒̇͜͜Ģ̶͔̠̣̯̱̼̀̈́À̷͚̋̏͘͘͠T̴̨̰̭̓͋̔̀̓͊̄͐̇̇͒͐̓́͝I̵̡͓̖̼̒̈́͌̇͜Z̶̬̦̟̥͇͍̦͉̰̬͗͗̌̍̿̔̽͗̑̇͋̑͠͝͝O̴͖͇͈̾ͅN̷̝̺̺͎̻̟̞͓̳̠̎͜ͅ—— ୨୧ꔛꗃ! :))))) ꃅꀎꃅꀎꀎꀎ ꃅ꓄꓄ꉣ &&& —————— ꀭꉣꁅ!
          :))))) ･ﾟ⋆ 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷)))) 🎀 ⋆ﾟ･
        </span>
      </UnstyledLink>
    </div>
  );
};

const ProjectList = ({ projects }: { projects: Project[] }) => {
  return (
    <>
      <div>
        <span className='font-bold'>⇝TH1𝓃𝑔S</span>
        <br />
        {projects.map((project) => (
          <UnstyledLink
            key={project.id}
            href={`/pages/${project.slug}`}
            className='hover:text-primary-600 line-clamp-1 hover:underline'
          >
            🎀 ⋆ﾟ･
            {project.slug}
          </UnstyledLink>
        ))}
      </div>
      <UnstyledLink href='/stories'>
        ⋆.˚ ᡣ𐭩 .𖥔˚ music ⋆.˚✮🎧✮˚.⋆ &nd pics -----⇒
      </UnstyledLink>
    </>
  );
};

const ClientWorkList = ({ clients }: { clients: Client[] }) => {
  return (
    <div>
      <span className='font-bold'>⇝𝒞𝓁LI€NT</span>
      <br />
      {clients.map((client) => (
        <UnstyledLink
          key={client.id}
          href={`${client.url}`}
          className='hover:text-primary-600 line-clamp-1 hover:underline'
        >
          (^‿^)-𝒷))))
          {client.name}
        </UnstyledLink>
      ))}
    </div>
  );
};

// eslint-disable-next-line unused-imports/no-unused-vars
export const Introduction = ({ projects }: { projects: Project[] }) => {
  return (
    <div className='flex flex-col gap-4 text-xs font-light tracking-tight md:flex-row xl:gap-16 xl:text-base'>
      <div className='md:w-4/12'>
        <Info />
      </div>
      <div className='md:w-4/12'>
        <ProjectList projects={projects} />
      </div>
      <div className='md:w-4/12'>
        <ClientWorkList clients={clients} />
      </div>
    </div>
  );
};
