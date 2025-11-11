"use client";

import { spacing } from "@httpjpg/tokens";
import { Button } from "@httpjpg/ui";
import { css } from "@linaria/core";

const buttonGroup = css`
  display: flex;
  gap: ${spacing[4]};
  flex-wrap: wrap;
`;

/**
 * Client Component wrapper for interactive buttons
 * Separated from Server Component page for better performance
 */
export function InteractiveButtons() {
  return (
    <div className={buttonGroup}>
      <Button onClick={() => alert("Primary clicked!")}>Primary Button</Button>
      <Button variant="secondary" onClick={() => alert("Secondary clicked!")}>
        Secondary Button
      </Button>
      <Button variant="outline" size="lg" onClick={() => alert("Outline!")}>
        Outline Large
      </Button>
    </div>
  );
}
