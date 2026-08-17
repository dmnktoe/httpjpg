import { z } from "zod";

import { MAX_QUESTION_LENGTH } from "./prompt";

export const askSourceSchema = z.object({
  title: z.string(),
  href: z.string(),
  kind: z.enum(["work", "page"]).optional(),
});

export const askNavigateActionSchema = z.object({
  type: z.literal("navigate"),
  href: z
    .string()
    .refine((href) => href.startsWith("/") && !href.startsWith("//"), "same-origin path"),
  title: z.string(),
  kind: z.enum(["work", "page"]).default("page"),
});

export const askSourcesEventSchema = z.object({
  type: z.literal("sources"),
  sources: z.array(askSourceSchema).default([]),
});

export const askDeltaEventSchema = z.object({
  type: z.literal("delta"),
  text: z.string(),
});

export const askActionEventSchema = z.object({
  type: z.literal("action"),
  action: askNavigateActionSchema,
});

export const askErrorEventSchema = z.object({
  type: z.literal("error"),
  error: z
    .string()
    .transform((value) => value.trim() || "ai_failed")
    .default("ai_failed"),
});

export const askEventSchema = z.discriminatedUnion("type", [
  askSourcesEventSchema,
  askDeltaEventSchema,
  askActionEventSchema,
  askErrorEventSchema,
]);

export type AskSource = z.infer<typeof askSourceSchema>;
export type AskNavigateAction = z.infer<typeof askNavigateActionSchema>;
export type AskEvent = z.infer<typeof askEventSchema>;

export type AskQuestionResult =
  | { ok: true; question: string }
  | { ok: false; error: "missing_question" | "question_too_long" };

export function parseAskQuestion(body: unknown): AskQuestionResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "missing_question" };
  }
  const question = (body as { question?: unknown }).question;
  if (typeof question !== "string") {
    return { ok: false, error: "missing_question" };
  }
  const trimmed = question.trim();
  if (!trimmed) {
    return { ok: false, error: "missing_question" };
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return { ok: false, error: "question_too_long" };
  }
  return { ok: true, question: trimmed };
}
