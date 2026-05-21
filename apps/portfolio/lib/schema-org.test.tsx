import { render } from "@testing-library/react";

import { generateCreativeWorkSchema, JsonLd } from "./schema-org";

interface CreativeWorkRecord {
  "@context"?: string;
  "@type"?: string;
  name?: string;
  url?: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: { "@type": string; name: string; url?: string };
  inLanguage?: string;
}

describe("generateCreativeWorkSchema", () => {
  it("returns a schema.org CreativeWork with the required fields", () => {
    const schema = generateCreativeWorkSchema({
      name: "My Project",
      url: "https://httpjpg.com/work/my-project",
    }) as CreativeWorkRecord;
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("CreativeWork");
    expect(schema.name).toBe("My Project");
    expect(schema.url).toBe("https://httpjpg.com/work/my-project");
  });

  it("forwards every optional field through to the schema", () => {
    const schema = generateCreativeWorkSchema({
      name: "Project",
      url: "https://httpjpg.com/work/p",
      description: "A description",
      image: ["https://cdn/a.jpg", "https://cdn/b.jpg"],
      datePublished: "2025-01-02",
      dateModified: "2025-02-03",
      author: { "@type": "Person", name: "Dominik", url: "https://httpjpg.com" },
    }) as CreativeWorkRecord;
    expect(schema.description).toBe("A description");
    expect(schema.image).toEqual(["https://cdn/a.jpg", "https://cdn/b.jpg"]);
    expect(schema.datePublished).toBe("2025-01-02");
    expect(schema.dateModified).toBe("2025-02-03");
    expect(schema.author).toEqual({
      "@type": "Person",
      name: "Dominik",
      url: "https://httpjpg.com",
    });
  });

  it("defaults the language to de-DE", () => {
    const schema = generateCreativeWorkSchema({ name: "n", url: "u" }) as CreativeWorkRecord;
    expect(schema.inLanguage).toBe("de-DE");
  });

  it("leaves optional fields undefined when omitted", () => {
    const schema = generateCreativeWorkSchema({ name: "n", url: "u" }) as CreativeWorkRecord;
    expect(schema.description).toBeUndefined();
    expect(schema.image).toBeUndefined();
    expect(schema.datePublished).toBeUndefined();
    expect(schema.dateModified).toBeUndefined();
    expect(schema.author).toBeUndefined();
  });
});

describe("JsonLd", () => {
  it("renders a ld+json script tag with the stringified data", () => {
    const data = generateCreativeWorkSchema({ name: "A", url: "https://example.com" });
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(script?.innerHTML ?? "{}")).toEqual(data);
  });
});
