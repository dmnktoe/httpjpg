export interface HttpFailure {
  ok: false;
  status: number;
  message: string;
}

export type HttpResult = { ok: true; response: Response } | HttpFailure;

export interface FetchWithTimeoutOptions extends Omit<RequestInit, "signal"> {
  label: string;
  timeoutMs?: number;
  hint?: string;
}

const DEFAULT_TIMEOUT_MS = 5000;

export async function fetchWithTimeout(
  url: string,
  { label, timeoutMs = DEFAULT_TIMEOUT_MS, hint, ...init }: FetchWithTimeoutOptions,
): Promise<HttpResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init, signal: controller.signal });
  } catch (error) {
    if ((error as { name?: string } | null)?.name === "AbortError") {
      return { ok: false, status: 504, message: `${label} request timed out.` };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: hint ? `Status ${response.status}. ${hint}` : `Status ${response.status}.`,
    };
  }

  return { ok: true, response };
}

export async function readJson<T>(
  response: Response,
  label: string,
): Promise<{ ok: true; data: T } | HttpFailure> {
  try {
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 502, message: `Malformed ${label} response.` };
  }
}
