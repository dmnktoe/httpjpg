"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";

import type { PageBadgeProps } from "./page-badge";

/** Slot setter of the nearest `PageBadgeProvider`; null without one. */
export const PageBadgeContext = createContext<Dispatch<
  SetStateAction<PageBadgeProps | null>
> | null>(null);
