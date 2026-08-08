#!/usr/bin/env tsx

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { ask, done, fail, hasFlag, heading, reportSecret, warn } from "./lib/cli";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PROFILE_URL = "https://api.spotify.com/v1/me";

const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

const REDIRECT_PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;
const CALLBACK_TIMEOUT_MS = 5 * 60_000;

interface SpotifyTokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

function browserPage(title: string, detail: string): string {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font:16px/1.6 ui-monospace,monospace;padding:3rem;max-width:34rem">
<h1 style="font-size:1.1rem">${title}</h1><p>${detail}</p></body>`;
}

function openBrowser(url: string): void {
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

function listenOnLoopback(): Promise<Server> {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();

    server.once("error", (error: NodeJS.ErrnoException) => {
      rejectPromise(
        error.code === "EADDRINUSE"
          ? new Error(
              `Port ${REDIRECT_PORT} is already in use — free it and retry, the redirect URI is registered on that port`,
            )
          : error,
      );
    });

    server.listen(REDIRECT_PORT, "127.0.0.1", () => resolvePromise(server));
  });
}

function awaitCallback(server: Server, expectedState: string): Promise<string> {
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
      rejectPromise(new Error(`No callback within ${CALLBACK_TIMEOUT_MS / 60_000} minutes`));
    }, CALLBACK_TIMEOUT_MS);

    server.on("error", (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
}

async function requestToken(
  body: Record<string, string>,
  clientId: string,
  clientSecret: string,
): Promise<{ status: number; payload: SpotifyTokenResponse | null; raw: string }> {
  const response = await fetch(TOKEN_URL, {
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

function describeTokenFailure(status: number, payload: SpotifyTokenResponse | null, raw: string) {
  const detail = payload?.error_description ?? payload?.error ?? raw.trim().slice(0, 200);
  return `${status}: ${detail || "empty response"}`;
}

async function exchangeCode(code: string, clientId: string, clientSecret: string): Promise<string> {
  const { status, payload, raw } = await requestToken(
    { grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI },
    clientId,
    clientSecret,
  );

  if (status !== 200 || !payload?.refresh_token) {
    fail(`Token exchange failed — ${describeTokenFailure(status, payload, raw)}`);
  }
  return payload.refresh_token;
}

async function reportAccount(accessToken: string | undefined): Promise<void> {
  if (!accessToken) {
    return;
  }
  try {
    const response = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return;
    }
    const profile = (await response.json()) as { display_name?: string; id?: string };
    done(`Authorized as ${profile.display_name ?? profile.id ?? "unknown account"}`);
  } catch {}
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const clientId = process.env.SPOTIFY_CLIENT_ID || (await ask("SPOTIFY_CLIENT_ID: "));
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || (await ask("SPOTIFY_CLIENT_SECRET: "));

  if (!clientId || !clientSecret) {
    fail("Both SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required.");
  }

  const server = await listenOnLoopback().catch((error: Error) => fail(error.message));

  const state = randomUUID();
  const authorizeUrl = `${AUTHORIZE_URL}?${new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    state,
    show_dialog: "true",
  })}`;

  heading("Spotify authorization");
  console.log(`Listening on ${REDIRECT_URI}`);
  console.log(`This exact URI must be registered under Dashboard → Settings → Redirect URIs.\n`);
  console.log(`Opening the consent screen. If nothing happens, visit:\n  ${authorizeUrl}\n`);
  openBrowser(authorizeUrl);

  const code = await awaitCallback(server, state).catch((error: Error) => fail(error.message));
  const refreshToken = await exchangeCode(code, clientId, clientSecret);

  const verification = await requestToken(
    { grant_type: "refresh_token", refresh_token: refreshToken },
    clientId,
    clientSecret,
  );
  if (verification.status !== 200) {
    warn(
      `Minted, but the refresh grant came back ${describeTokenFailure(verification.status, verification.payload, verification.raw)}`,
    );
  } else {
    await reportAccount(verification.payload?.access_token);
  }

  reportSecret("SPOTIFY_REFRESH_TOKEN", refreshToken, hasFlag(argv, "write"));
}

await main();
