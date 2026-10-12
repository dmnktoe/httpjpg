import { render } from "@testing-library/react";

import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateCreativeWorkSchema,
  generatePersonSchema,
  generateProfilePageSchema,
  generateSiteGraph,
  JsonLd,
  schemaIds,
  serializeJsonLd,
  toGraph,
} from "./schema-org";

type SchemaRecord = Record<string, unknown>;

function record(value: unknown): SchemaRecord {
  return value as SchemaRecord;
}

describe("schemaIds", () => {
  it("anchors the website and person ids on the site root", () => {
    expect(schemaIds("https://httpjpg.com/")).toEqual({
      website: "https://httpjpg.com/#website",
      person: "https://httpjpg.com/#person",
    });
  });
});

describe("generateSiteGraph", () => {
  it("links the WebSite to the Person by id", () => {
    const graph = generateSiteGraph({
      baseUrl: "https://httpjpg.com",
      name: "httpjpg",
      description: "Portfolio",
      inLanguage: "de-DE",
      author: { name: "Dominik", url: "https://httpjpg.com", sameAs: ["https://github.com/x"] },
    });
    const [website, person] = (graph?.["@graph"] ?? []) as readonly SchemaRecord[];
    expect(graph?.["@context"]).toBe("https://schema.org");
    expect(website).toMatchObject({
      "@type": "WebSite",
      "@id": "https://httpjpg.com/#website",
      url: "https://httpjpg.com/",
      name: "httpjpg",
      inLanguage: "de-DE",
      publisher: { "@id": "https://httpjpg.com/#person" },
    });
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": "https://httpjpg.com/#person",
      name: "Dominik",
      sameAs: ["https://github.com/x"],
    });
  });

  it("drops the person reference when no author is configured", () => {
    const graph = generateSiteGraph({ baseUrl: "https://httpjpg.com", name: "httpjpg" });
    const nodes = (graph?.["@graph"] ?? []) as readonly SchemaRecord[];
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).not.toHaveProperty("publisher");
  });

  it("returns null when there is nothing to describe", () => {
    expect(generateSiteGraph({ baseUrl: "https://httpjpg.com" })).toBeNull();
  });
});

describe("generatePersonSchema", () => {
  it("omits sameAs entirely when there are no profiles", () => {
    expect(generatePersonSchema({ name: "Dominik" })).not.toHaveProperty("sameAs");
  });
});

describe("generateCreativeWorkSchema", () => {
  it("returns a CreativeWork node keyed by its url", () => {
    const schema = record(
      generateCreativeWorkSchema({
        name: "My Project",
        url: "https://httpjpg.com/work/my-project",
        inLanguage: "de-DE",
      }),
    );
    expect(schema["@type"]).toBe("CreativeWork");
    expect(schema["@id"]).toBe("https://httpjpg.com/work/my-project#work");
    expect(schema.name).toBe("My Project");
    expect(schema.inLanguage).toBe("de-DE");
  });

  it("forwards author, site link, keywords and media", () => {
    const schema = record(
      generateCreativeWorkSchema({
        name: "Project",
        url: "https://httpjpg.com/work/p",
        description: "A description",
        image: ["https://cdn/a.jpg"],
        datePublished: "2025-01-02",
        dateModified: "2025-02-03",
        author: { id: "https://httpjpg.com/#person", name: "Dominik" },
        isPartOf: { "@id": "https://httpjpg.com/#website" },
        keywords: ["TypeScript", "Design"],
        video: [{ "@type": "VideoObject", name: "Clip" }],
        audio: [{ "@type": "MusicRecording", name: "Song" }],
        associatedMedia: [{ "@type": "ImageObject", contentUrl: "https://cdn/a.jpg" }],
      }),
    );
    expect(schema.author).toEqual({
      "@type": "Person",
      "@id": "https://httpjpg.com/#person",
      name: "Dominik",
    });
    expect(schema.isPartOf).toEqual({ "@id": "https://httpjpg.com/#website" });
    expect(schema.keywords).toBe("TypeScript, Design");
    expect(schema.video).toHaveLength(1);
    expect(schema.audio).toHaveLength(1);
    expect(schema.associatedMedia).toHaveLength(1);
  });

  it("leaves optional fields out when omitted", () => {
    const schema = record(generateCreativeWorkSchema({ name: "n", url: "u" }));
    expect(schema.author).toBeUndefined();
    expect(schema).not.toHaveProperty("keywords");
    expect(schema).not.toHaveProperty("video");
    expect(schema).not.toHaveProperty("audio");
    expect(schema).not.toHaveProperty("associatedMedia");
  });
});

describe("generateBreadcrumbSchema", () => {
  it("numbers the trail from one", () => {
    const schema = record(
      generateBreadcrumbSchema([
        { name: "Home", url: "https://httpjpg.com/" },
        { name: "Project", url: "https://httpjpg.com/work/p" },
      ]),
    );
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://httpjpg.com/" },
      { "@type": "ListItem", position: 2, name: "Project", item: "https://httpjpg.com/work/p" },
    ]);
  });
});

describe("generateProfilePageSchema", () => {
  it("points mainEntity at the site person", () => {
    const schema = record(
      generateProfilePageSchema({
        url: "https://httpjpg.com/cv",
        name: "CV",
        personId: "https://httpjpg.com/#person",
      }),
    );
    expect(schema["@type"]).toBe("ProfilePage");
    expect(schema.mainEntity).toEqual({ "@id": "https://httpjpg.com/#person" });
  });
});

describe("generateCollectionPageSchema", () => {
  it("lists entries as a positioned ItemList", () => {
    const schema = record(
      generateCollectionPageSchema({
        url: "https://httpjpg.com/",
        name: "httpjpg",
        items: [{ name: "A", url: "https://httpjpg.com/work/a", image: "https://cdn/a.jpg" }],
      }),
    );
    expect(schema.mainEntity).toEqual({
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          url: "https://httpjpg.com/work/a",
          name: "A",
          image: "https://cdn/a.jpg",
        },
      ],
    });
  });
});

describe("serializeJsonLd", () => {
  it("escapes `<` so CMS text cannot close the script tag", () => {
    const json = serializeJsonLd(toGraph([{ "@type": "Thing", name: "</script><b>x" }]));
    expect(json).not.toContain("<");
    expect(JSON.parse(json)["@graph"][0].name).toBe("</script><b>x");
  });
});

describe("JsonLd", () => {
  it("renders a ld+json script tag with the graph", () => {
    const data = toGraph([generateCreativeWorkSchema({ name: "A", url: "https://example.com" })]);
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector("script");
    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(script?.innerHTML ?? "{}")).toEqual(JSON.parse(JSON.stringify(data)));
  });
});
