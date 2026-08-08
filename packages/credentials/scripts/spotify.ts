#!/usr/bin/env tsx

/**
 * Mint a `SPOTIFY_REFRESH_TOKEN` for the now-playing widget.
 *
 * Spotify only hands out a refresh token through the authorization-code flow,
 * which needs a real browser round-trip. The script opens the consent screen,
 * catches the redirect on a throwaway loopback server, and trades the code in.
 *
 *   pnpm --filter @httpjpg/credentials spotify [--write] [--port 8888]
 *
 * The redirect URI below must be registered verbatim under
 * Dashboard → your app → Settings → Redirect URIs.
 */

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { ask, done, fail, hasFlag, heading, readOption, reportSecret, warn } from "./lib/cli";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PROFILE_URL = "https://api.spotify.com/v1/me";

// The widget only reads what is playing right now; keep the grant that narrow.
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

const DEFAULT_PORT = 8888;
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
    // Detached and unref'd so a missing opener can never hold the CLI open.
    const child = spawn(command, [url], {
      stdio: "ignore",
      detached: true,
      shell: process.platform === "win32",
    });
    child.on("error", () => {});
    child.unref();
  } catch {
    // Opening a browser is a convenience; the URL is printed either way.
  }
}

/**
 * Serve exactly one redirect and resolve with the authorization code.
 */
function awaitCallback(port: number, expectedState: string): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
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
      // A mismatched state means the redirect did not come from our request.
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

    server.on("error", (error: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      rejectPromise(
        error.code === "EADDRINUSE"
          ? new Error(`Port ${port} is already in use — retry with --port <other>`)
          : error,
      );
    });

    server.listen(port, "127.0.0.1");
  });
}

/**
 * Post to the token endpoint. A proxy or gateway in front of Spotify answers
 * with HTML rather than JSON, so never hand the body straight to JSON.parse.
 */
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

async function exchangeCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const { status, payload, raw } = await requestToken(
    { grant_type: "authorization_code", code, redirect_uri: redirectUri },
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
  } catch {
    // Confirming the account is a nicety, never a reason to fail the mint.
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const port = Number(readOption(argv, "port") ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    fail(`Invalid --port "${readOption(argv, "port")}"`);
  }

  const redirectUri = `http://127.0.0.1:${port}/callback`;
  const clientId = process.env.SPOTIFY_CLIENT_ID || (await ask("SPOTIFY_CLIENT_ID: "));
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || (await ask("SPOTIFY_CLIENT_SECRET: "));

  if (!clientId || !clientSecret) {
    fail("Both SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required.");
  }

  const state = randomUUID();
  const authorizeUrl = `${AUTHORIZE_URL}?${new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    state,
    // Force the consent screen so re-running always yields a fresh token.
    show_dialog: "true",
  })}`;

  heading("Spotify authorization");
  console.log(`Redirect URI (must be registered in the dashboard):\n  ${redirectUri}\n`);
  console.log(`Opening the consent screen. If nothing happens, visit:\n  ${authorizeUrl}\n`);
  openBrowser(authorizeUrl);

  const code = await awaitCallback(port, state).catch((error: Error) => fail(error.message));
  const refreshToken = await exchangeCode(code, redirectUri, clientId, clientSecret);

  // Spend it once immediately: a refresh token that cannot refresh is worthless.
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
