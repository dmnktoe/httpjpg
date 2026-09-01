import { CloudflareLogo, FooterStatusLine, FooterStatusLineText } from "@httpjpg/ui";

const CLOUDFLARE_HREF = "https://www.cloudflare.com";

/**
 * Theme-matched footer line under the live widgets. The whole row links out
 * to Cloudflare; the lockup inherits the page foreground so it tracks theme.
 */
export function CloudflareStatus() {
  return (
    <FooterStatusLine href={CLOUDFLARE_HREF}>
      <FooterStatusLineText fixed dim>
        backed & secured by
      </FooterStatusLineText>
      <CloudflareLogo />
    </FooterStatusLine>
  );
}
