import { loader } from "fumadocs-core/source";
import { createSource } from "fumadocs-mdx";

export const { getPage, getPages, pageTree } = loader({
  baseUrl: "/docs",
  rootDir: "docs",
  source: createSource({
    files: {
      scan: "docs/**/*.mdx",
    },
    mdx: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  }),
});
