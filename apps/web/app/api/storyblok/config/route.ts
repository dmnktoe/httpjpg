import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const storyblokApi = getStoryblokApi();

    // Check if token is available - support both env var names
    const accessToken =
      process.env.STORYBLOK_PREVIEW_TOKEN ||
      process.env.NEXT_PUBLIC_STORYBLOK_TOKEN ||
      process.env.STORYBLOK_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        "STORYBLOK_PREVIEW_TOKEN or NEXT_PUBLIC_STORYBLOK_TOKEN not configured",
      );
    }

    // Fetch space info
    const spaceResponse = await fetch(
      `https://api.storyblok.com/v2/cdn/spaces/me?token=${accessToken}`,
    );

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      throw new Error(
        `Failed to fetch Storyblok space info: ${spaceResponse.status} - ${errorText}`,
      );
    }

    const spaceData = await spaceResponse.json();
    const space = spaceData.space;

    // Fetch stories to get counts
    const storiesResponse = await storyblokApi.getStories({
      version: "draft",
      per_page: 1,
    });

    const totalStories = storiesResponse.total || 0;

    // Fetch published stories count
    const publishedResponse = await storyblokApi.getStories({
      version: "published",
      per_page: 1,
    });

    const publishedStories = publishedResponse.total || 0;
    const drafts = totalStories - publishedStories;

    // Fetch components count (optional, requires Management API token)
    let componentsTotal = 0;
    const managementToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;

    if (managementToken) {
      try {
        const componentsResponse = await fetch(
          `https://mapi.storyblok.com/v1/spaces/${space.id}/components?per_page=1`,
          {
            headers: {
              Authorization: managementToken,
            },
          },
        );

        if (componentsResponse.ok) {
          await componentsResponse.json();
          componentsTotal = Number.parseInt(
            componentsResponse.headers.get("total") || "0",
            10,
          );
        }
      } catch (error) {
        console.warn("Failed to fetch components count:", error);
      }
    }

    // Fetch datasources count (optional, requires Management API token)
    let datasourcesTotal = 0;
    if (managementToken) {
      try {
        const datasourcesResponse = await fetch(
          `https://mapi.storyblok.com/v1/spaces/${space.id}/datasources?per_page=1`,
          {
            headers: {
              Authorization: managementToken,
            },
          },
        );

        if (datasourcesResponse.ok) {
          await datasourcesResponse.json();
          datasourcesTotal = Number.parseInt(
            datasourcesResponse.headers.get("total") || "0",
            10,
          );
        }
      } catch (error) {
        console.warn("Failed to fetch datasources count:", error);
      }
    }

    const config = {
      space: {
        name: space.name,
        domain: space.domain,
        id: space.id,
        plan: space.plan_level || "free",
      },
      stories: {
        total: totalStories,
        published: publishedStories,
        drafts: Math.max(0, drafts),
      },
      components: {
        total: componentsTotal,
      },
      datasources: {
        total: datasourcesTotal,
      },
    };

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Error fetching Storyblok config:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Storyblok configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
