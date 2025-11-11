import { AspectRatio } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * AspectRatio component stories
 *
 * Maintains aspect ratio for media elements like images and videos.
 */
const meta = {
  title: "Layout/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: { type: "select" },
      options: ["1/1", "4/3", "16/9", "21/9", "9/16"],
      description: "Aspect ratio preset",
      table: {
        defaultValue: { summary: "16/9" },
      },
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 16:9 aspect ratio (widescreen)
 */
export const Widescreen: Story = {
  render: () => (
    <div style={{ maxWidth: "800px" }}>
      <AspectRatio ratio="16/9">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
};

/**
 * 1:1 aspect ratio (square)
 */
export const Square: Story = {
  render: () => (
    <div style={{ maxWidth: "400px" }}>
      <AspectRatio ratio="1/1">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
};

/**
 * 4:3 aspect ratio (classic)
 */
export const Classic: Story = {
  render: () => (
    <div style={{ maxWidth: "600px" }}>
      <AspectRatio ratio="4/3">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          4:3
        </div>
      </AspectRatio>
    </div>
  ),
};

/**
 * 21:9 aspect ratio (ultrawide)
 */
export const Ultrawide: Story = {
  render: () => (
    <div style={{ maxWidth: "900px" }}>
      <AspectRatio ratio="21/9">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          21:9
        </div>
      </AspectRatio>
    </div>
  ),
};

/**
 * 9:16 aspect ratio (portrait/mobile)
 */
export const Portrait: Story = {
  render: () => (
    <div style={{ maxWidth: "300px" }}>
      <AspectRatio ratio="9/16">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          9:16
        </div>
      </AspectRatio>
    </div>
  ),
};

/**
 * With actual image
 */
export const WithImage: Story = {
  render: () => (
    <div style={{ maxWidth: "800px" }}>
      <AspectRatio ratio="16/9">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=450&fit=crop"
          alt="Abstract art"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AspectRatio>
    </div>
  ),
};
