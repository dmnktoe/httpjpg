import { NextResponse } from "next/server";

interface UptimeKumaMonitor {
  id: number;
  name: string;
  sendUrl: number;
  type: string;
}

interface UptimeKumaGroup {
  id: number;
  name: string;
  weight: number;
  monitorList: UptimeKumaMonitor[];
}

interface UptimeKumaResponse {
  config: {
    slug: string;
    title: string;
    description: string | null;
    autoRefreshInterval: number;
  };
  publicGroupList: UptimeKumaGroup[];
}

export const runtime = "edge";

export async function GET() {
  try {
    const response = await fetch(
      "https://status.dmnktoe.de/api/status-page/httpjpg",
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    );

    if (!response.ok) {
      throw new Error(`Uptime Kuma API error: ${response.status}`);
    }

    const data: UptimeKumaResponse = await response.json();

    // Transform the data to match our frontend format
    const services = data.publicGroupList.flatMap((group) =>
      group.monitorList.map((monitor) => ({
        id: monitor.id,
        name: monitor.name,
        type: monitor.type,
        // We'll fetch individual monitor status from the heartbeat endpoint
        status: "operational" as const,
      })),
    );

    return NextResponse.json({
      title: data.config.title,
      description: data.config.description,
      refreshInterval: data.config.autoRefreshInterval,
      services,
    });
  } catch (error) {
    console.error("Failed to fetch Uptime Kuma status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status data" },
      { status: 500 },
    );
  }
}
