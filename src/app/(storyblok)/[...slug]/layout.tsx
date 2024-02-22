import StoryblokProvider from '@/components/helpers/StoryblokProvider';

type StoryblokLayoutProps = {
  children: React.ReactNode;
};

export default function StoryblokLayout({ children }: StoryblokLayoutProps) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <StoryblokProvider>{children}</StoryblokProvider>;
}
