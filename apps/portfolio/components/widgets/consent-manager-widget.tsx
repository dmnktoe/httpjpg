"use client";

import { ConsentWidget } from "@c15t/nextjs";

import "@c15t/nextjs/styles.css";

export function ConsentManagerWidget() {
  return <ConsentWidget hideBranding noStyle={false} />;
}
