"use client";

import { Box, Container } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { ConsoleHeader } from "../_components";

interface ServiceStatus {
  id: number;
  name: string;
  type: string;
  status: "operational" | "degraded" | "down" | "checking";
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const data = await response.json();
          setServices(data.services);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded Performance";
      case "down":
        return "Down";
      case "checking":
        return "Checking...";
    }
  };

  const allOperational =
    services.length > 0 && services.every((s) => s.status === "operational");
  const anyDown = services.some((s) => s.status === "down");

  return (
    <Box
      css={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ConsoleHeader
        tag="⇝ᵣₑcꫀₙₜ / 🟢"
        title="🟢 System Status ･ﾟ⋆"
        description="Real-time monitoring powered by Uptime Kuma"
      />

      {/* Overall Status Banner */}
      {!loading && (
        <Box
          css={{
            background: anyDown
              ? "danger.500"
              : allOperational
                ? "success.500"
                : "warning.500",
            color: "white",
          }}
        >
          <Container size="2xl" px={{ base: 4, md: 6, lg: 8 }} css={{ py: 6 }}>
            <Box css={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
              <Box
                css={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "white",
                }}
              />
              <Box css={{ fontSize: "lg", fontWeight: "bold" }}>
                {anyDown
                  ? "Some Systems Down"
                  : allOperational
                    ? "All Systems Operational"
                    : "Degraded Performance"}
              </Box>
            </Box>
            <Box css={{ fontSize: "sm", opacity: 0.9 }}>
              {anyDown
                ? "We're experiencing issues with some services. Our team is investigating."
                : allOperational
                  ? "All services are running normally. Everything is working as expected."
                  : "Some services are experiencing slower than normal response times."}
            </Box>
          </Container>
        </Box>
      )}

      {/* Services List */}
      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 6,
          flex: 1,
        }}
      >
        <Box
          css={{
            fontSize: "lg",
            fontWeight: "bold",
            mb: 4,
          }}
        >
          Service Status
        </Box>

        <Box css={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {services.map((service) => (
            <Box
              key={service.id}
              css={{
                p: 4,
                background: "neutral.50",
                display: "flex",
                flexDirection: { base: "column", md: "row" },
                alignItems: { base: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              <Box css={{ flex: 1 }}>
                <Box
                  css={{
                    fontSize: "md",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {service.name}
                </Box>
                <Box
                  css={{
                    fontSize: "xs",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "wider",
                  }}
                >
                  {service.type}
                </Box>
              </Box>

              <Box
                css={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  px: 3,
                  py: 1,
                  borderRadius: "9999px",
                  color: "white",
                  fontSize: "xs",
                  fontWeight: "bold",
                  position: "relative",
                  isolation: "isolate",
                  _before: {
                    content: '""',
                    position: "absolute",
                    inset: "-3px",
                    borderRadius: "inherit",
                    zIndex: -1,
                    background:
                      service.status === "operational"
                        ? "rgba(34, 197, 94, 0.9)"
                        : service.status === "degraded"
                          ? "rgba(234, 179, 8, 0.9)"
                          : "rgba(239, 68, 68, 0.9)",
                    filter: "blur(8px)",
                  },
                }}
              >
                <Box
                  css={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
                {getStatusText(service.status)}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
