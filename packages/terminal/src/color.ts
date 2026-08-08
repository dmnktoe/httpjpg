import { colors } from "@httpjpg/tokens/colors";

const isDisabled =
  Boolean(process.env.NO_COLOR) || process.env.TERM === "dumb" || !process.stdout.isTTY;

export function toAnsi(hex: string): string {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return `38;2;${(value >> 16) & 255};${(value >> 8) & 255};${value & 255}`;
}

function paint(code: string) {
  return (text: string): string => (isDisabled ? text : `[${code}m${text}[0m`);
}

function token(hex: string) {
  return paint(toAnsi(hex));
}

export const accent = token(colors.accent[500]);
export const primary = token(colors.primary[500]);
export const success = token(colors.success[500]);
export const warning = token(colors.warning[500]);
export const danger = token(colors.danger[500]);
export const muted = token(colors.neutral[500]);

export const bold = paint("1");
export const dim = paint("2");

export const colorEnabled = !isDisabled;
