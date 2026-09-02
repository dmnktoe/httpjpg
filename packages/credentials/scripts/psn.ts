#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { banner, done, fail, heading, step, warn } from "@httpjpg/terminal";
// oxlint-disable-next-line import/default
import psnApi from "psn-api";

import { ask, hasFlag, readOption, reportSecret } from "./lib/cli";
import { parseNpsso } from "./lib/npsso";
import {
  diagnoseRejection,
  formatDate,
  npssoExpiry,
  NPSSO_LIFETIME_DAYS,
  SSO_COOKIE_URL,
} from "./lib/psn-auth";

const { exchangeCodeForAccessToken, exchangeNpssoForCode, getProfileFromAccountId, getUserTitles } =
  psnApi;

async function resolveNpsso(argv: string[]): Promise<string> {
  const fromFlag = readOption(argv, "npsso");
  if (fromFlag) {
    return parseNpsso(fromFlag) ?? fail("could not read an npsso out of --npsso");
  }

  if (hasFlag(argv, "check")) {
    return (
      process.env.PSN_NPSSO ?? fail("--check needs PSN_NPSSO in .env.local or the environment")
    );
  }

  banner("psn · npsso");
  step("sign in to playstation, then open:");
  console.log(`    ${SSO_COOKIE_URL}\n`);
  step('paste the bare cookie, or the whole {"npsso":"…"} body\n');
  const answer = await ask("npsso");
  return parseNpsso(answer) ?? fail("that did not look like an npsso value");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const npsso = await resolveNpsso(argv);

  heading("verifying against psn");

  const accessCode = await exchangeNpssoForCode(npsso).catch(async () => {
    const diagnosis = await diagnoseRejection();
    return fail(
      `psn would not issue an access code\n    ${diagnosis}\n    fresh cookie · ${SSO_COOKIE_URL}`,
    );
  });

  const tokens = await exchangeCodeForAccessToken(accessCode);
  if (!tokens?.accessToken) {
    fail("psn returned no access token for that npsso");
  }

  const auth = { accessToken: tokens.accessToken };
  const profile = await getProfileFromAccountId(auth, "me").catch(() => null);
  const titles = await getUserTitles(auth, "me").catch(() => null);

  if (profile) {
    done(`${profile.onlineId}${profile.isPlus ? " · ps plus" : ""}`);
  } else {
    warn("token works, profile lookup failed · the widget avatar may stay empty");
  }

  if (titles) {
    done(`trophy library · ${titles.trophyTitles.length} titles`);
  } else {
    warn("token works, trophy list unreadable");
  }

  const expiresOn = npssoExpiry();
  step(
    `~${NPSSO_LIFETIME_DAYS} day lifetime · if minted today, lapses around ${formatDate(expiresOn)}`,
  );

  if (hasFlag(argv, "check")) {
    done("psn_npsso is valid · nothing to do");
    return;
  }

  reportSecret("PSN_NPSSO", npsso, hasFlag(argv, "write"));
}

await main();
