import { jsonOk } from "@/lib/api/json";

export function GET() {
  return jsonOk({ status: "ok" });
}
