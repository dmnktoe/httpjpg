#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { randomUUID } from "node:crypto";

import { banner, done, fail, heading, primary, step, warn } from "@httpjpg/terminal";

import { ask, hasFlag, reportSecret } from "./lib/cli";
import {
  AUTHORIZE_URL,
  awaitCallback,
  exchangeCode,
  listenOnLoopback,
  openBrowser,
  REDIRECT_URI,
  reportAccount,
  requestToken,
  SCOPES,
} from "./lib/spotify-oauth";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  banner("spotify · refresh token");

  const clientId = process.env.SPOTIFY_CLIENT_ID || (await ask("client id"));
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || (await ask("client secret"));

  if (!clientId || !clientSecret) {
    fail("both SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required");
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

  heading("authorization");
  step(`listening on ${REDIRECT_URI}`);
  step("this exact uri must be registered under dashboard → settings → redirect uris");
  step("opening the consent screen · if nothing happens, visit:");
  console.log(`\n    ${primary(authorizeUrl)}\n`);
  openBrowser(authorizeUrl);

  const code = await awaitCallback(server, state).catch((error: Error) => fail(error.message));
  const refreshToken = await exchangeCode(code, clientId, clientSecret).catch((error: Error) =>
    fail(error.message),
  );

  const verification = await requestToken(
    { grant_type: "refresh_token", refresh_token: refreshToken },
    clientId,
    clientSecret,
  );
  if (verification.status !== 200) {
    warn(
      `minted, but the refresh grant came back ${verification.status}: ${verification.payload?.error_description ?? verification.payload?.error ?? verification.raw.trim().slice(0, 200)}`,
    );
  } else {
    const account = await reportAccount(verification.payload?.access_token);
    if (account) {
      done(`authorized as ${account}`);
    }
  }

  reportSecret("SPOTIFY_REFRESH_TOKEN", refreshToken, hasFlag(argv, "write"));
}

await main();
