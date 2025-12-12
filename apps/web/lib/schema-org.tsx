import type { Thing, WithContext } from "schema-dts";

/**
 * Generate Schema.org JSON-LD for a creative work/portfolio piece
 *
 * @see https://schema.org/CreativeWork
 */
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

/**
 * Component to render JSON-LD script tag
 */
export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe for JSON-LD structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
