import { CookieCenter, VendorList } from "@httpjpg/consent";
import { Box, Container, Divider, Headline, Link, Paragraph, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

const LAST_UPDATED = "June 3, 2026";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How httpjpg.com uses cookies and similar technologies, the categories we rely on, the third-party services involved, and how to manage your preferences.",
};

export default function CookiePolicyPage() {
  return (
    <Section pt={{ base: "12", md: "20" }} pb={{ base: "16", md: "24" }}>
      <Container size="md">
        <Headline level={1}>⇝🍪 ᴄᴏᴏᴋɪᴇ ᴘᴏʟɪᴄʏ 🍪⇝</Headline>
        <Paragraph size="sm" color="muted" css={{ mt: "2", fontFamily: "mono" }}>
          Last updated: {LAST_UPDATED}
        </Paragraph>
        <Paragraph size="md" maxWidth="readable" spacing>
          This policy explains how httpjpg.com uses cookies and similar technologies — small files
          and device identifiers stored on your device — to run the site, remember your choices,
          understand usage, and load external media. You stay in control: review the categories
          below and adjust your preferences at any time.
        </Paragraph>

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          What are cookies?
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          Cookies are small text files a website stores on your device. They let the site remember
          information between visits — like your theme preference — and help us understand how the
          site is used. Some are strictly necessary for the site to function; others are optional
          and only set once you consent.
        </Paragraph>

        <Headline level={2} as="h2">
          How we use them
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          We use cookies and similar technologies to keep the site working, remember your settings,
          monitor errors and performance, measure aggregate usage, and — only with your consent —
          load embedded content from external video and audio platforms. We do not use cookies to
          build advertising profiles.
        </Paragraph>

        <Headline level={2} as="h2">
          Cookie categories
        </Headline>
        <Box as="ul" css={{ pl: "5", m: 0, mb: "4", display: "grid", gap: "2" }}>
          <Box as="li">
            <strong>Preferences</strong> — remembers your settings (e.g. theme). Strictly necessary,
            always on.
          </Box>
          <Box as="li">
            <strong>Monitoring</strong> — error tracking and performance monitoring so the site
            stays stable. Strictly necessary, always on.
          </Box>
          <Box as="li">
            <strong>Analytics</strong> — privacy-conscious, aggregate usage statistics. Optional and
            off by default.
          </Box>
          <Box as="li">
            <strong>Media &amp; external services</strong> — loads embeds from video and audio
            platforms. Optional and off by default.
          </Box>
        </Box>

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Third-party services
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          When you consent to optional categories, the following services may receive data from this
          site or store and access cookies on your device. Each links to its own privacy policy.
        </Paragraph>
        <VendorList />

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Manage your preferences
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          Update your choices below — they take effect immediately and are saved for future visits.
          You can also reopen the cookie banner at any time from the site footer.
        </Paragraph>
        <CookieCenter />

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Changes to this policy
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          We may update this policy as the site evolves or as services change. When we do, we revise
          the “last updated” date above. Significant changes may reset optional consent so you can
          review them.
        </Paragraph>

        <Headline level={2} as="h2">
          Contact
        </Headline>
        <Paragraph size="md" maxWidth="readable">
          Questions about this policy or how your data is handled? Reach out via the channels listed
          on the <Link href="/">home page</Link>.
        </Paragraph>
      </Container>
    </Section>
  );
}
