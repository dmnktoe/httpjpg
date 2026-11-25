import type { Metadata } from "next";

import { NotFoundScreen } from "@/components/ui/not-found-screen";

export const metadata: Metadata = { title: "Not Found" };

export default function RootNotFound() {
  return <NotFoundScreen />;
}
