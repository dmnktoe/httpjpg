import { Box } from "@httpjpg/ui";

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Box
      css={{
        p: 6,
        background: "neutral.50",
      }}
    >
      <Box
        css={{
          fontSize: "xs",
          opacity: 50,
          mb: 2,
          textTransform: "uppercase",
          letterSpacing: "wider",
        }}
      >
        {label}
      </Box>
      <Box
        css={{
          fontSize: "3xl",
          fontWeight: "bold",
          fontFamily: "mono",
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
