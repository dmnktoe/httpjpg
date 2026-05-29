import { VendorList } from "@httpjpg/consent";
import { Box, Divider, Headline, Link, Paragraph, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { ThemeSync } from "@/components/ui/theme-sync";
import { ConsentManagerWidget } from "@/components/widgets/consent-manager-widget";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How this site uses cookies and similar technologies, the third-party services involved, and how to manage your consent preferences.",
};

interface CategoryInfo {
  title: string;
  body: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    title: "Preferences (required)",
    body: "Remembers your settings — such as your consent choices and theme. The site cannot function correctly without these.",
  },
  {
    title: "Monitoring (required)",
    body: "Error tracking and performance monitoring so we can keep the site stable and fix issues.",
  },
  {
    title: "Analytics (optional)",
    body: "Helps us understand how visitors interact with the site, in aggregate. Loaded only after you opt in.",
  },
  {
    title: "Media & External Services (optional)",
    body: "Embedded video and audio players from third parties. Loaded only when you opt in and play the content.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <ThemeSync theme="light" />
      <Section pt={16} pb={16} useContainer containerSize="md">
        <Headline level={1} marginBottom="1rem">
          Cookie Policy
        </Headline>

        <Paragraph size="md" color="muted" spacing>
          This page explains how this website uses cookies and similar storage technologies, which
          third-party services are involved, and how you can review or change your consent at any
          time.
        </Paragraph>

        <Paragraph size="md" spacing>
          When you first visit, only strictly necessary storage is used. Optional services —
          analytics and external media — load exclusively after you grant consent, and are removed
          again if you withdraw it. Your choices are stored locally in your browser under the{" "}
          <Box as="code" css={{ fontFamily: "mono", fontSize: "sm" }}>
            httpjpg_consent
          </Box>{" "}
          key.
        </Paragraph>

        <Divider spacing="6" />

        <Headline level={2} as="h2" marginBottom="1rem">
          Categories
        </Headline>

        <Box as="dl" css={{ display: "flex", flexDirection: "column", gap: "4", m: 0 }}>
          {CATEGORIES.map((category) => (
            <Box key={category.title}>
              <Box as="dt" css={{ fontWeight: "bold", mb: "1" }}>
                {category.title}
              </Box>
              <Box as="dd" css={{ m: 0, color: "pageMuted" }}>
                {category.body}
              </Box>
            </Box>
          ))}
        </Box>

        <Headline level={2} as="h2" marginTop="2.5rem" marginBottom="1rem">
          Third-party services
        </Headline>

        <Paragraph size="md" spacing>
          The following external services may set cookies or load remote content, grouped by the
          consent category that controls them:
        </Paragraph>

        <VendorList />

        <Divider spacing="6" />

        <Headline level={2} as="h2" marginBottom="1rem">
          Manage your preferences
        </Headline>

        <Paragraph size="md" spacing>
          Use the controls below to update your consent. Changes take effect immediately and apply
          across the whole site.
        </Paragraph>

        <ConsentManagerWidget />

        <Paragraph size="sm" color="muted" spacing>
          You can also reopen the consent banner anytime via the “Cookie settings” link in the
          footer. Questions? Reach out via the <Link href="/imprint">imprint</Link>.
        </Paragraph>
      </Section>
    </>
  );
}
