import { type ExtractedColor, NowPlaying } from "@httpjpg/now-playing";
import type { Meta } from "@storybook/react";
import { useEffect, useState } from "react";

// Debug badge to show extracted color info
const ColorDebugBadge = ({ data }: { data: { artwork: string } | null }) => {
  const [color, setColor] = useState<ExtractedColor | null>(null);

  useEffect(() => {
    if (!data?.artwork) {
      return;
    }

    // Use the same extraction method as the component
    import("@httpjpg/now-playing").then(({ extractVibrantColor }) => {
      extractVibrantColor(data.artwork).then(setColor);
    });
  }, [data?.artwork]);

  if (!color) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        padding: "0.75rem 1rem",
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "11px",
        borderRadius: "8px",
        border: `2px solid ${color.rgb}`,
        zIndex: 10000,
      }}
    >
      🎨 {color.rgb} · Text: {color.textColor}
    </div>
  );
};

const meta = {
  title: "Components/NowPlaying/Spotify",
  component: NowPlaying,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NowPlaying>;

export default meta;

/**
 * Live Spotify Data with Vibrant Color
 * Fetches real data from Spotify API and automatically extracts vibrant color from album artwork
 * Component now handles color extraction internally - no manual state management needed!
 * Requires dev server running with SPOTIFY credentials in .env.local
 */
export const LiveData = {
  render: () => {
    const [data, setData] = useState<{
      title: string;
      artist: string;
      artwork: string;
      isPlaying: boolean;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;

      const fetchNowPlaying = async () => {
        try {
          const response = await fetch(
            "https://localhost:3000/api/spotify/now-playing",
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const json = await response.json();

          if (isMounted) {
            setData(json.data);
            setIsLoading(false);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
            setIsLoading(false);
          }
        }
      };

      fetchNowPlaying();
      const interval = setInterval(fetchNowPlaying, 10000);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, []);

    if (isLoading) {
      return (
        <NowPlaying
          title="Loading..."
          artist="..."
          artwork="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E"
          isPlaying={false}
          isLoading={true}
        />
      );
    }

    if (error) {
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontFamily: "monospace",
            color: "#ff0000",
          }}
        >
          Error: {error}
          <br />
          <br />
          Make sure dev server is running at localhost:3000
        </div>
      );
    }

    if (!data) {
      return (
        <NowPlaying
          title="╱╱ Nothing playing ╱╱"
          artist="⋄ ⋄ ⋄"
          artwork="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E"
          isPlaying={false}
          autoExtractColor={false}
          vibrantColor="rgba(163, 163, 163, 0.6)"
        />
      );
    }

    // Component now handles color extraction automatically! 🎨
    return (
      <>
        <NowPlaying {...data} />
        <ColorDebugBadge data={data} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story fetches real data from your Spotify account. The NowPlaying component automatically extracts vibrant colors from the artwork and calculates optimal text contrast. No manual color state management needed!",
      },
    },
  },
};
