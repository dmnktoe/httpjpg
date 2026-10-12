import type {
  BreadcrumbList,
  CollectionPage,
  CreativeWork,
  Graph,
  Person,
  ProfilePage,
  Thing,
  WebSite,
} from "schema-dts";

interface SchemaAuthor {
  name: string;
  url?: string;
  /** Profile URLs that identify the same author elsewhere. */
  sameAs?: string[];
}

interface SchemaRef {
  "@id": string;
}

interface SchemaIds {
  website: string;
  person: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ListedItem {
  name: string;
  url: string;
  image?: string;
}

/**
 * Stable node ids so every page's graph points at the same WebSite and
 * Person the root layout declares, instead of restating a copy per page.
 */
export function schemaIds(baseUrl: string): SchemaIds {
  const base = trimTrailingSlash(baseUrl);
  return { website: `${base}/#website`, person: `${base}/#person` };
}

// https://schema.org/WebSite + https://schema.org/Person
export function generateSiteGraph({
  baseUrl,
  name,
  description,
  inLanguage,
  author,
}: {
  baseUrl: string;
  name?: string;
  description?: string;
  inLanguage?: string;
  author?: SchemaAuthor | null;
}): Graph | null {
  const ids = schemaIds(baseUrl);
  const nodes: Thing[] = [];

  if (name) {
    const website: WebSite = {
      "@type": "WebSite",
      "@id": ids.website,
      url: `${trimTrailingSlash(baseUrl)}/`,
      name,
      description,
      inLanguage,
      ...(author ? { author: { "@id": ids.person }, publisher: { "@id": ids.person } } : {}),
    };
    nodes.push(website);
  }
  if (author) {
    nodes.push(generatePersonSchema({ ...author, id: ids.person }));
  }

  return nodes.length ? toGraph(nodes) : null;
}

// https://schema.org/Person
export function generatePersonSchema({
  id,
  name,
  url,
  sameAs,
}: SchemaAuthor & { id?: string }): Person {
  return {
    "@type": "Person",
    ...(id ? { "@id": id } : {}),
    name,
    url,
    ...(sameAs?.length ? { sameAs } : {}),
  };
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
  isPartOf,
  keywords,
  video,
  audio,
  associatedMedia,
}: {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  datePublished?: string;
  dateModified?: string;
  /** Inline enough of the author to stand alone; `@id` merges it with the site graph. */
  author?: SchemaAuthor & { id?: string };
  inLanguage?: string;
  isPartOf?: SchemaRef;
  keywords?: string[];
  video?: Thing[];
  audio?: Thing[];
  associatedMedia?: Thing[];
}): CreativeWork {
  return {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author: author ? generatePersonSchema(author) : undefined,
    inLanguage,
    isPartOf,
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    // schema-dts types these as single-kind unions; mixed media lists are valid JSON-LD.
    ...(video?.length ? { video: video as CreativeWork["video"] } : {}),
    ...(audio?.length ? { audio: audio as CreativeWork["audio"] } : {}),
    ...(associatedMedia?.length
      ? { associatedMedia: associatedMedia as CreativeWork["associatedMedia"] }
      : {}),
  } as CreativeWork;
}

// https://schema.org/BreadcrumbList
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// https://schema.org/ProfilePage — Google's profile rich result for creators.
export function generateProfilePageSchema({
  url,
  name,
  personId,
  dateCreated,
  dateModified,
  inLanguage,
  isPartOf,
}: {
  url: string;
  name: string;
  personId: string;
  dateCreated?: string;
  dateModified?: string;
  inLanguage?: string;
  isPartOf?: SchemaRef;
}): ProfilePage {
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name,
    mainEntity: { "@id": personId },
    dateCreated,
    dateModified,
    inLanguage,
    isPartOf,
  };
}

// https://schema.org/CollectionPage with an ItemList of its entries.
export function generateCollectionPageSchema({
  url,
  name,
  description,
  items,
  isPartOf,
}: {
  url: string;
  name: string;
  description?: string;
  items: ListedItem[];
  isPartOf?: SchemaRef;
}): CollectionPage {
  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    description,
    isPartOf,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.name,
        ...(item.image ? { image: item.image } : {}),
      })),
    },
  };
}

export function toGraph(nodes: Thing[]): Graph {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      // CMS text lands in here verbatim; escaping `<` keeps a stray `</script>`
      // from closing the tag early.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function serializeJsonLd(data: Graph): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
