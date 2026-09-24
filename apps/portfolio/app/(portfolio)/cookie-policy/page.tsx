import { COOKIE_DATABASE_ORIGIN, CookieCenter, SITE_COOKIES, VendorList } from "@httpjpg/consent";
import {
  Container,
  Divider,
  Headline,
  Link,
  ListItem,
  Paragraph,
  Section,
  UnorderedList,
} from "@httpjpg/ui";
import type { Metadata } from "next";

const LAST_UPDATED = "September 22, 2026";

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
          and only set once you consent. Service and cookie descriptions are linked to{" "}
          <Link href={COOKIE_DATABASE_ORIGIN} target="_blank" rel="noopener noreferrer">
            cookiedatabase.org
          </Link>{" "}
          where available.
        </Paragraph>

        <Headline level={2} as="h2">
          How we use them
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          We use cookies and similar technologies to keep the site working, remember your settings,
          monitor errors and performance, measure aggregate usage with privacy-friendly analytics
          (Umami, self-hosted in the EU, cookieless, on by default with opt-out), and — only with
          your consent — load embedded content from external video and audio platforms. We do not
          use cookies to build advertising profiles, and we no longer use Google Analytics.
        </Paragraph>

        <Headline level={2} as="h2">
          Cookie categories
        </Headline>
        <UnorderedList size="md">
          <ListItem size="md">
            <strong>Preferences</strong> — remembers your settings (e.g. theme and consent choices).
            Strictly necessary, always on.
          </ListItem>
          <ListItem size="md">
            <strong>Monitoring</strong> — error tracking and performance monitoring so the site
            stays stable. Strictly necessary, always on.
          </ListItem>
          <ListItem size="md">
            <strong>Analytics</strong> — privacy-conscious, aggregate usage statistics via
            self-hosted Umami (Hetzner Nürnberg, EU). On by default; opt out anytime.
          </ListItem>
          <ListItem size="md">
            <strong>Media &amp; external services</strong> — loads embeds from video and audio
            platforms. Optional and off by default.
          </ListItem>
        </UnorderedList>

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Cookies we use
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          Named cookies that may appear on this site. Entries with a Cookie Database link open the
          corresponding page on cookiedatabase.org.
        </Paragraph>
        <UnorderedList size="md">
          {SITE_COOKIES.map((cookie) => (
            <ListItem key={`${cookie.provider}-${cookie.name}`} size="md">
              <strong>
                <code>{cookie.name}</code>
              </strong>{" "}
              — {cookie.purpose} ({cookie.provider}; {cookie.duration}
              {cookie.category === "media" ? "; only after media consent" : ""}).
              {cookie.cookieDatabase ? (
                <>
                  {" "}
                  <Link href={cookie.cookieDatabase} target="_blank" rel="noopener noreferrer">
                    Cookie Database
                  </Link>
                </>
              ) : null}
            </ListItem>
          ))}
        </UnorderedList>
        <Paragraph size="sm" color="muted" css={{ mt: "3", fontFamily: "mono" }}>
          Descriptions for third-party cookies are sourced from{" "}
          <Link href={COOKIE_DATABASE_ORIGIN} target="_blank" rel="noopener noreferrer">
            cookiedatabase.org
          </Link>
          .
        </Paragraph>

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Third-party services
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          The following services may receive data from this site or store and access cookies on your
          device. Each links to its privacy policy and, where catalogued, its cookiedatabase.org
          entry. Media embeds only load after you opt in.
        </Paragraph>
        <VendorList />

        <Divider variant="ascii" preset="sparkles" spacing="8" />

        <Headline level={2} as="h2">
          Manage your preferences
        </Headline>
        <Paragraph size="md" maxWidth="readable" spacing>
          Update your choices below — they take effect immediately and are saved for future visits.
          You can also reopen the cookie banner at any time from the site footer. Reject All turns
          analytics off and keeps media embeds blocked.
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
