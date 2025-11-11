import { Headline, Paragraph } from "@httpjpg/ui";
import { InteractiveButtons } from "./InteractiveButtons";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Headline level={1}>Welcome to httpjpg</Headline>
      <Headline level={2}>This is a Next.js demo page</Headline>

      <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        <Paragraph size="lg">
          This page demonstrates the UI components from the monorepo, including
          buttons, headlines, and body text with optimal typography.
        </Paragraph>
      </div>

      <InteractiveButtons />

      <div style={{ marginTop: "2rem" }}>
        <Headline level={3}>About this project</Headline>
        <Paragraph>
          This is a Turborepo monorepo with shared UI components, design tokens,
          and TypeScript configurations. All components use zero-runtime
          CSS-in-JS via Linaria for optimal performance.
        </Paragraph>
        <div style={{ marginTop: "1rem" }}>
          <Paragraph size="sm">
            The design system features a brutalist aesthetic with vibrant accent
            colors, glass morphism effects, and responsive typography that
            adapts to different screen sizes.
          </Paragraph>
        </div>
      </div>
    </main>
  );
}
