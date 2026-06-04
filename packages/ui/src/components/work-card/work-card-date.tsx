import { Box } from "../box/box";
import { HStack } from "../stack/stack";

const MONTH_SYMBOLS: Record<number, string> = {
  0: "❄",
  1: "❤",
  2: "🌱",
  3: "🌸",
  4: "☀",
  5: "🌊",
  6: "🔥",
  7: "🌾",
  8: "🍂",
  9: "🎃",
  10: "🍁",
  11: "✨",
};

function formatWorkCardDate(date: string | Date): {
  day: string;
  month: string;
  year: string;
  monthSymbol: string;
} {
  const dateObj = new Date(date);
  const parts = new Intl.DateTimeFormat("de-DE", {
    year: "2-digit",
    month: "narrow",
    day: "2-digit",
  }).formatToParts(dateObj);

  return {
    day: parts.find((p) => p.type === "day")?.value || "",
    month: parts.find((p) => p.type === "month")?.value || "",
    year: parts.find((p) => p.type === "year")?.value || "",
    monthSymbol: MONTH_SYMBOLS[dateObj.getMonth()] || "●",
  };
}

export function WorkCardDate({ date, dateEnd }: { date: string | Date; dateEnd?: string | Date }) {
  const start = formatWorkCardDate(date);
  const end = dateEnd ? formatWorkCardDate(dateEnd) : null;

  return (
    <HStack gap="2" align="center" css={{ mb: "1", fontFamily: "mono", fontSize: "sm" }}>
      <Box css={{ opacity: 0.5 }}>╱╱</Box>
      <Box css={{ letterSpacing: "wider" }}>
        {start.day}.
        <Box
          as="span"
          css={{
            position: "relative",
            top: "1px",
            mx: "1",
            fontFamily: "system-ui",
            fontSize: "md",
          }}
        >
          {start.monthSymbol} {start.month}
        </Box>
        {start.year}
        {end && (
          <>
            <Box as="span" css={{ mx: "2", opacity: 0.5 }}>
              →
            </Box>
            {end.day}.
            <Box
              as="span"
              css={{
                position: "relative",
                top: "1px",
                mx: "1",
                fontFamily: "system-ui",
                fontSize: "md",
              }}
            >
              {end.monthSymbol} {end.month}
            </Box>
            {end.year}
          </>
        )}
      </Box>
      <Box css={{ opacity: 0.3, fontSize: "0.65rem" }}>⌘ρτ</Box>
    </HStack>
  );
}
