import type { Thing, WithContext } from "schema-dts";

interface SchemaAuthor {
  "@type": "Person" | "Organization";
  name: string;
  url?: string;
  /** Profile URLs that identify the same author elsewhere. */
  sameAs?: string[];
}

// https://schema.org/CreativeWork
export function generateCreativeWorkSchema({
  name,
  description,
  image,
  url,
  datePublished,
  dateModified,
  author,
  inLanguage,
}: {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: SchemaAuthor;
  inLanguage: string;
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
    inLanguage,
  };
}

// https://schema.org/Person
export function generatePersonSchema({
  name,
  url,
  sameAs,
}: {
  name: string;
  url?: string;
  sameAs?: string[];
}): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
