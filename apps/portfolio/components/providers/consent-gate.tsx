"use client";

import { type ConsentCategory, useConsentCategory } from "@httpjpg/consent";
import type { ReactNode } from "react";

interface ConsentGateProps {
  category: ConsentCategory;
  children: ReactNode;
}

export function ConsentGate({ category, children }: ConsentGateProps) {
  return useConsentCategory(category) ? <>{children}</> : null;
}
