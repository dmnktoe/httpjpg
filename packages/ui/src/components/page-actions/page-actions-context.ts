"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";

import type { PageActionsProps } from "./page-actions";

/** Slot setter of the nearest `PageActionsProvider`; null without one. */
export const PageActionsContext = createContext<Dispatch<
  SetStateAction<PageActionsProps | null>
> | null>(null);
