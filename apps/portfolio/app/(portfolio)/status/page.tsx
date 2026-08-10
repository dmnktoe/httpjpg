import { Box, Container, Headline, Link, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { ThemeSync } from "@/components/ui/theme-sync";
import { SessionVitals } from "@/components/widgets/session-vitals";
import { config as appConfig } from "@/lib/config";
import {
  getBuildInfo,
  getSiteStatus,
  SERVICE_STATES,
  type ServiceState,
  type ServiceStatus,
} from "@/lib/queries/status";

const TITLE = "Status";
const DESCRIPTION = "Build, integrations and performance of this deployment.";

const SHORT_SHA_LENGTH = 7;

const STATE_MARK: Record<ServiceState, string> = {
  [SERVICE_STATES.ok]: "●",
  [SERVICE_STATES.down]: "▲",
  [SERVICE_STATES.off]: "○",
};

const STATE_COLOR: Record<ServiceState, string> = {
  [SERVICE_STATES.ok]: "success.500",
  [SERVICE_STATES.down]: "danger.500",
  [SERVICE_STATES.off]: "pageFg",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/status" },
  robots: { index: false, follow: true },
};

export default async function StatusPage() {
  const { services, checkedAt } = await getSiteStatus();
  const build = getBuildInfo(appConfig.repositoryUrl);
  const down = services.filter((entry) => entry.state === SERVICE_STATES.down);

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt="16" pb="16" useContainer={false}>
        <Container size="lg">
          <Headline level={1}>{TITLE}</Headline>
          <Box css={{ maxW: "65ch", mt: "3", opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
            {down.length === 0
              ? "Everything that is switched on is answering."
              : `${down.length} ${down.length === 1 ? "service is" : "services are"} not answering.`}{" "}
            Checked {checkedAt.slice(0, 19).replace("T", " ")} UTC.
          </Box>

          <Box css={{ display: "flex", flexDirection: "column", gap: "10", mt: "12" }}>
            <Block label="build">
              <Box
                as="dl"
                css={{
                  display: "grid",
                  gridTemplateColumns: { base: "1fr", sm: "8rem 1fr" },
                  gap: "2",
                  fontFamily: "mono",
                  fontSize: "sm",
                }}
              >
                <Field label="version">
                  {build.version ? (
                    <Link
                      href={`${build.repositoryUrl}/releases/tag/${build.version}`}
                      isExternal
                      css={{ color: "primary.500" }}
                    >
                      {build.version}
                    </Link>
                  ) : (
                    "unknown"
                  )}
                </Field>
                <Field label="commit">
                  {build.commitSha ? (
                    <Link
                      href={`${build.repositoryUrl}/commit/${build.commitSha}`}
                      isExternal
                      css={{ color: "primary.500" }}
                    >
                      {build.commitSha.slice(0, SHORT_SHA_LENGTH)}
                    </Link>
                  ) : (
                    "unknown"
                  )}
                </Field>
                <Field label="built">
                  {build.buildTime ? build.buildTime.slice(0, 19).replace("T", " ") : "unknown"}
                </Field>
              </Box>
            </Block>

            <Block label="services">
              <Box
                as="ul"
                css={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2",
                  fontFamily: "mono",
                  fontSize: "sm",
                  listStyle: "none",
                }}
              >
                {services.map((entry) => (
                  <ServiceRow key={entry.id} service={entry} />
                ))}
              </Box>
              <Box css={{ mt: "4", opacity: 0.4, fontFamily: "mono", fontSize: "xs" }}>
                ● answering · ▲ not answering · ○ switched off. Rows without a latency were read
                from configuration, not called.
              </Box>
            </Block>

            <Block label="vitals · this page load, in your browser">
              <SessionVitals />
            </Block>
          </Box>
        </Container>
      </Section>
    </>
  );
}

function ServiceRow({ service }: { service: ServiceStatus }) {
  return (
    <Box
      as="li"
      css={{
        display: "grid",
        gridTemplateColumns: { base: "1.5rem 1fr", sm: "1.5rem 10rem 1fr" },
        alignItems: "baseline",
        gap: "2",
      }}
    >
      <Box as="span" aria-hidden="true" css={{ color: STATE_COLOR[service.state] }}>
        {STATE_MARK[service.state]}
      </Box>
      <Box as="span">
        {service.label}
        <Box as="span" css={{ srOnly: true }}>
          {` — ${service.state}`}
        </Box>
      </Box>
      <Box as="span" css={{ opacity: 0.4, wordBreak: "break-word" }}>
        {service.detail}
      </Box>
    </Box>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Box as="dt" css={{ opacity: 0.4 }}>
        {label}
      </Box>
      <Box as="dd">{children}</Box>
    </>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box
        as="h2"
        css={{
          mb: "3",
          opacity: 0.5,
          fontFamily: "mono",
          fontSize: "xs",
          fontWeight: "normal",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Box>
      {children}
    </Box>
  );
}

export const dynamic = "force-dynamic";
