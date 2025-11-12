"use client";

import { Button, HStack } from "@httpjpg/ui";

/**
 * Client Component wrapper for interactive buttons
 * Separated from Server Component page for better performance
 */
export function InteractiveButtons() {
  return (
    <HStack gap="4" wrap>
      <Button onClick={() => alert("Primary clicked!")}>Primary Button</Button>
      <Button variant="secondary" onClick={() => alert("Secondary clicked!")}>
        Secondary Button
      </Button>
      <Button variant="outline" size="lg" onClick={() => alert("Outline!")}>
        Outline Large
      </Button>
    </HStack>
  );
}
