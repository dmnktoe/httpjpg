import type { Thing, WithContext } from "schema-dts";

// https://schema.org/CreativeWork
export function generateCreativeWorkSchema({
  name,
  description,
  image,
  url,
  datePublished,
  dateModified,
  author,
}: {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
}): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author,
    inLanguage: "de-DE",
  };
}

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
