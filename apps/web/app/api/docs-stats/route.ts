import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

async function countFiles(dir: string, extension: string): Promise<number> {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        count += await countFiles(fullPath, extension);
      } else if (file.name.endsWith(extension)) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error(`Error counting files in ${dir}:`, error);
    return 0;
  }
}

export async function GET() {
  try {
    const docsPath = path.join(process.cwd(), "../docs/content/docs");
    const storybookPath = path.join(process.cwd(), "../storybook/stories");

    // Count documentation files
    const guidesCount = await countFiles(docsPath, ".mdx");

    // Count storybook files
    const storiesCount = await countFiles(storybookPath, ".stories.tsx");

    // Estimate other stats based on file counts
    const apiRefsCount = Math.max(1, Math.floor(guidesCount * 0.3));
    const examplesCount = Math.max(1, Math.floor(guidesCount * 0.8));
    const componentsCount = storiesCount;
    const variantsCount = Math.max(1, Math.floor(storiesCount * 5));

    return NextResponse.json({
      documentation: {
        guides: guidesCount,
        apiRefs: apiRefsCount,
        examples: examplesCount,
      },
      storybook: {
        components: componentsCount,
        stories: storiesCount,
        variants: variantsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching docs stats:", error);
    return NextResponse.json(
      {
        documentation: { guides: 0, apiRefs: 0, examples: 0 },
        storybook: { components: 0, stories: 0, variants: 0 },
      },
      { status: 500 },
    );
  }
}
