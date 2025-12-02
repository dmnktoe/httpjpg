import { getConfig } from "../../../lib/get-config";

/**
 * Preview Page for Config Story
 * Only used in Storyblok Visual Editor
 * Shows a preview of the site configuration
 */
export default async function ConfigPreviewPage() {
  const config = await getConfig();

  if (!config) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h1>⚠️ Config Story Not Found</h1>
        <p>Please create a Config story with slug "config" in Storyblok.</p>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "800px" }}
    >
      <h1>📋 Config Story Preview</h1>
      <p style={{ color: "#666" }}>
        This is a preview of your site configuration.
        <br />
        Changes will be reflected in the header and footer after publishing.
      </p>

      <hr style={{ margin: "2rem 0", border: "1px solid #ddd" }} />

      <h2>🧭 Navigation Menu</h2>
      {config.header_menu && config.header_menu.length > 0 ? (
        <ul>
          {config.header_menu.map((item: any, idx: number) => (
            <li key={idx}>
              <strong>{item.label}</strong> →{" "}
              {item.link.cached_url || item.link.url}
              {item.variant && ` [${item.variant}]`}
              {item.is_external && " 🔗"}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#999" }}>No menu items configured</p>
      )}

      <hr style={{ margin: "2rem 0", border: "1px solid #ddd" }} />

      <h2>🦶 Footer Configuration</h2>
      {config.footer_config?.[0] ? (
        <div>
          <p>
            <strong>Copyright:</strong>{" "}
            {config.footer_config[0].copyright_text || "Not set"}
          </p>
          <p>
            <strong>Show Default Links:</strong>{" "}
            {config.footer_config[0].show_default_links ? "Yes" : "No"}
          </p>
          {config.footer_config[0].social_links && (
            <>
              <p>
                <strong>Social Links:</strong>
              </p>
              <ul>
                {config.footer_config[0].social_links.map(
                  (link: any, idx: number) => (
                    <li key={idx}>
                      {link.platform}: {link.url}
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>
      ) : (
        <p style={{ color: "#999" }}>No footer configuration</p>
      )}

      <hr style={{ margin: "2rem 0", border: "1px solid #ddd" }} />

      <h2>🔍 SEO Settings</h2>
      <p>
        <strong>Site Name:</strong> {config.site_name || "Not set"}
      </p>
      <p>
        <strong>SEO Title:</strong> {config.seo_title || "Not set"}
      </p>
      <p>
        <strong>SEO Description:</strong> {config.seo_description || "Not set"}
      </p>

      <hr style={{ margin: "2rem 0", border: "1px solid #ddd" }} />

      <div
        style={{
          background: "#f5f5f5",
          padding: "1rem",
          borderRadius: "4px",
          marginTop: "2rem",
        }}
      >
        <strong>💡 Tip:</strong> After making changes, publish the Config story
        to see updates across the site.
      </div>
    </div>
  );
}
