import { Project } from '@/interfaces/Project';

function generateRandomSeed() {
  return (
    'https://unsplash.it/1920/900?random=' + Math.floor(Math.random() * 1000)
  );
}

export const projects: Project[] = [
  {
    id: 1,
    name: 'Outlet L𝒶bel Store CGI—te3s𝒽a𝓎 MIX',
    slug: '2023_04_16_outlet-label-store-cgi-te3shay-mix.html',
    description:
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
    images: [generateRandomSeed(), generateRandomSeed(), generateRandomSeed()],
    category: {
      name: 'free',
      slug: 'free',
    },
  },
  {
    id: 2,
    name: 'SaaS: TimeCurve Easy Time-Tracking',
    slug: '2022_10_30_saas-timecurve-easy-time-tracking application.html',
    description:
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
    images: [
      generateRandomSeed(),
      generateRandomSeed(),
      generateRandomSeed(),
      generateRandomSeed(),
      generateRandomSeed(),
      generateRandomSeed(),
    ],
    category: {
      name: 'free',
      slug: 'free',
    },
  },
  {
    id: 3,
    name: 'Project 3',
    slug: 'project-3',
    description:
      'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
    images: [generateRandomSeed(), generateRandomSeed(), generateRandomSeed()],
    category: {
      name: 'client',
      slug: 'client',
    },
  },
];
