import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "dev_c0nsole",
  description:
    "Central hub for monitoring, managing, and exploring the httpjpg monorepo",
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
