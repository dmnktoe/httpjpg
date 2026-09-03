import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";

export const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const TOKEN_URL = "https://accounts.spotify.com/api/token";
export const PROFILE_URL = "https://api.spotify.com/v1/me";
export const REDIRECT_PORT = 8888;
export const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;
export const CALLBACK_TIMEOUT_MS = 5 * 60_000;
export const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

export interface SpotifyTokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

export function browserPage(title: string, detail: string): string {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font:16px/1.6 ui-monospace,monospace;padding:3rem;max-width:34rem">
<h1 style="font-size:1.1rem">${title}</h1><p>${detail}</p></body>`;
}

export function openBrowser(url: string): void {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    const child = spawn(command, [url], {
      stdio: "ignore",
      detached: true,
      shell: process.platform === "win32",
    });
    child.on("error", () => {});
    child.unref();
  } catch {}
}

export function listenOnLoopback(): Promise<Server> {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();

    server.once("error", (error: NodeJS.ErrnoException) => {
      rejectPromise(
        error.code === "EADDRINUSE"
          ? new Error(
              `port ${REDIRECT_PORT} is already in use · free it and retry, the redirect uri is registered on that port`,
            )
          : error,
      );
    });

    server.listen(REDIRECT_PORT, "127.0.0.1", () => resolvePromise(server));
  });
}

export function awaitCallback(server: Server, expectedState: string): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    server.on("request", (request, response) => {
      const url = new URL(request.url ?? "/", REDIRECT_URI);
      if (url.pathname !== "/callback") {
        response.writeHead(404).end();
        return;
      }

      const error = url.searchParams.get("error");
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      const settle = (page: string, failure?: string) => {
        response.writeHead(failure ? 400 : 200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(page);
        server.close();
        clearTimeout(timer);
        if (failure) {
          rejectPromise(new Error(failure));
        } else {
          resolvePromise(code as string);
        }
      };

      if (error) {
        settle(
          browserPage("Authorization denied", "You can close this tab."),
          `Spotify returned "${error}"`,
        );
        return;
      }
      if (state !== expectedState) {
        settle(
          browserPage("State mismatch", "You can close this tab."),
          "Callback state did not match",
        );
        return;
      }
      if (!code) {
        settle(
          browserPage("No code returned", "You can close this tab."),
          "Callback carried no authorization code",
        );
        return;
      }

      settle(
        browserPage(
          "Spotify connected",
          "Token minted — you can close this tab and return to the terminal.",
        ),
      );
    });

    const timer = setTimeout(() => {
      server.close();
      rejectPromise(new Error(`no callback within ${CALLBACK_TIMEOUT_MS / 60_000} minutes`));
    }, CALLBACK_TIMEOUT_MS);

    server.on("error", (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
}

export async function requestToken(
  body: Record<string, string>,
  clientId: string,
  clientSecret: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ status: number; payload: SpotifyTokenResponse | null; raw: string }> {
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams(body),
  });

  const raw = await response.text();
  try {
    return { status: response.status, payload: JSON.parse(raw) as SpotifyTokenResponse, raw };
  } catch {
    return { status: response.status, payload: null, raw };
  }
}

export function describeTokenFailure(
  status: number,
  payload: SpotifyTokenResponse | null,
  raw: string,
): string {
  const detail = payload?.error_description ?? payload?.error ?? raw.trim().slice(0, 200);
  return `${status}: ${detail || "empty response"}`;
}

export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const { status, payload, raw } = await requestToken(
    { grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI },
    clientId,
    clientSecret,
    fetchImpl,
  );

  if (status !== 200 || !payload?.refresh_token) {
    throw new Error(`token exchange failed · ${describeTokenFailure(status, payload, raw)}`);
  }
  return payload.refresh_token;
}

export async function reportAccount(
  accessToken: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  if (!accessToken) {
    return null;
  }
  try {
    const response = await fetchImpl(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return null;
    }
    const profile = (await response.json()) as { display_name?: string; id?: string };
    return profile.display_name ?? profile.id ?? "unknown account";
  } catch {
    return null;
  }
}
