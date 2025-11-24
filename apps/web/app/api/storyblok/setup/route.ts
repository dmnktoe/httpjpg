import { env } from "@httpjpg/env";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Setup Storyblok Components via Management API
 *
 * Usage: POST /api/storyblok/setup
 *
 * Creates all necessary components for Config Story:
 * - config (content type)
 * - menu_link (block)
 * - footer_config (block)
 * - social_link (block)
 */

const MANAGEMENT_API_URL = "https://mapi.storyblok.com/v1";

interface StoryblokComponent {
  name: string;
  display_name?: string;
  schema: Record<string, any>;
  is_root?: boolean;
  is_nestable?: boolean;
  component_group_uuid?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get management token from request or env
    const { token } = await request.json().catch(() => ({}));
    const managementToken = token || env.STORYBLOK_PREVIEW_TOKEN;

    if (!managementToken) {
      return NextResponse.json(
        {
          error: "Management token required",
          message:
            "Provide token in request body or set STORYBLOK_PREVIEW_TOKEN",
        },
        { status: 400 },
      );
    }

    // Get space ID from public token
    const spaceId = env.NEXT_PUBLIC_STORYBLOK_TOKEN?.split("-")[0];
    if (!spaceId) {
      return NextResponse.json(
        { error: "Invalid Storyblok token" },
        { status: 400 },
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: managementToken,
    };

    const results: any[] = [];

    // 1. Create menu_link block
    const menuLink: StoryblokComponent = {
      name: "menu_link",
      display_name: "Menu Link",
      is_nestable: true,
      schema: {
        label: {
          type: "text",
          pos: 0,
          display_name: "Label",
          required: true,
          description: "Text der im Menü angezeigt wird",
        },
        link: {
          type: "multilink",
          pos: 1,
          display_name: "Link",
          required: true,
        },
        variant: {
          type: "option",
          pos: 2,
          display_name: "Variant",
          default_value: "personal",
          description: "Visual style: personal (🎀) or client ((^‿^))",
          options: [
            { value: "personal", name: "Personal Work" },
            { value: "client", name: "Client Work" },
          ],
        },
        is_external: {
          type: "boolean",
          pos: 3,
          display_name: "External Link",
          default_value: false,
          description: "Zeigt externes Link Icon",
        },
        target: {
          type: "option",
          pos: 4,
          display_name: "Target",
          default_value: "_self",
          description:
            "Wird automatisch auf '_blank' gesetzt wenn External Link aktiv ist",
          options: [
            { value: "_self", name: "Same Window" },
            { value: "_blank", name: "New Window" },
          ],
        },
      },
    };

    try {
      const res1 = await fetch(
        `${MANAGEMENT_API_URL}/spaces/${spaceId}/components`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ component: menuLink }),
        },
      );
      const data1 = await res1.json();
      results.push({
        component: "menu_link",
        status: res1.status,
        data: data1,
      });
    } catch (error) {
      results.push({ component: "menu_link", error: String(error) });
    }

    // 2. Create social_link block
    const socialLink: StoryblokComponent = {
      name: "social_link",
      display_name: "Social Link",
      is_nestable: true,
      schema: {
        platform: {
          type: "option",
          pos: 0,
          display_name: "Platform",
          required: true,
          options: [
            { value: "instagram", name: "Instagram" },
            { value: "twitter", name: "Twitter" },
            { value: "github", name: "GitHub" },
            { value: "linkedin", name: "LinkedIn" },
            { value: "youtube", name: "YouTube" },
            { value: "facebook", name: "Facebook" },
          ],
        },
        url: {
          type: "text",
          pos: 1,
          display_name: "URL",
          required: true,
          regex: "https?://.*",
        },
      },
    };

    try {
      const res2 = await fetch(
        `${MANAGEMENT_API_URL}/spaces/${spaceId}/components`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ component: socialLink }),
        },
      );
      const data2 = await res2.json();
      results.push({
        component: "social_link",
        status: res2.status,
        data: data2,
      });
    } catch (error) {
      results.push({ component: "social_link", error: String(error) });
    }

    // 3. Create footer_config block
    const footerConfig: StoryblokComponent = {
      name: "footer_config",
      display_name: "Footer Config",
      is_nestable: true,
      schema: {
        copyright_text: {
          type: "text",
          pos: 0,
          display_name: "Copyright Text",
          default_value: "© 2025 httpjpg. All rights reserved.",
        },
        show_default_links: {
          type: "boolean",
          pos: 1,
          display_name: "Show Default Links",
          default_value: false,
          description: "Zeigt 'Legal' und 'Privacy' Links",
        },
        social_links: {
          type: "bloks",
          pos: 2,
          display_name: "Social Links",
          restrict_type: "",
          restrict_components: true,
          component_whitelist: ["social_link"],
        },
        background_image: {
          type: "asset",
          pos: 3,
          display_name: "Background Image",
          filetypes: ["images"],
        },
      },
    };

    try {
      const res3 = await fetch(
        `${MANAGEMENT_API_URL}/spaces/${spaceId}/components`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ component: footerConfig }),
        },
      );
      const data3 = await res3.json();
      results.push({
        component: "footer_config",
        status: res3.status,
        data: data3,
      });
    } catch (error) {
      results.push({ component: "footer_config", error: String(error) });
    }

    // 4. Create config content type
    const config: StoryblokComponent = {
      name: "config",
      display_name: "Config",
      is_root: true,
      is_nestable: false,
      schema: {
        site_name: {
          type: "text",
          pos: 0,
          display_name: "Site Name",
        },
        header_menu: {
          type: "bloks",
          pos: 1,
          display_name: "Header Menu",
          required: true,
          restrict_type: "",
          restrict_components: true,
          component_whitelist: ["menu_link"],
          description: "Navigation items für Header",
        },
        footer_config: {
          type: "bloks",
          pos: 2,
          display_name: "Footer Config",
          restrict_type: "",
          restrict_components: true,
          component_whitelist: ["footer_config"],
          maximum: 1,
        },
        seo_title: {
          type: "text",
          pos: 3,
          display_name: "SEO Title",
        },
        seo_description: {
          type: "textarea",
          pos: 4,
          display_name: "SEO Description",
        },
      },
    };

    try {
      const res4 = await fetch(
        `${MANAGEMENT_API_URL}/spaces/${spaceId}/components`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ component: config }),
        },
      );
      const data4 = await res4.json();
      results.push({ component: "config", status: res4.status, data: data4 });
    } catch (error) {
      results.push({ component: "config", error: String(error) });
    }

    // Summary
    const success = results.filter((r) => r.status === 201).length;
    const failed = results.filter((r) => r.status !== 201 || r.error).length;

    return NextResponse.json({
      message: `Setup completed: ${success} components created, ${failed} failed`,
      results,
      nextSteps: [
        "Go to Storyblok Content → New Entry",
        "Create a new 'Config' story with slug 'config'",
        "Add menu_link blocks to header_menu field",
        "Publish the Config story",
      ],
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
