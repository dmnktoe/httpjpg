import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect homepage to docs
  redirect("/docs");
}
