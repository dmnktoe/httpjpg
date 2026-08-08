#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

// oxlint-disable-next-line import/default
import psnApi from "psn-api";

import { ask, done, fail, hasFlag, heading, readOption, reportSecret, warn } from "./lib/cli";
import { parseNpsso } from "./lib/npsso";

const { exchangeCodeForAccessToken, exchangeNpssoForCode, getProfileFromAccountId, getUserTitles } =
  psnApi;

const SSO_COOKIE_URL = "https://ca.account.sony.com/api/v1/ssocookie";
const AUTHORIZE_URL = "https://ca.account.sony.com/api/authz/v3/oauth/authorize";

const NPSSO_LIFETIME_DAYS = 60;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function diagnoseRejection(): Promise<string> {
  try {
    const response = await fetch(`${AUTHORIZE_URL}?response_type=code`, {
      headers: { Cookie: "npsso=probe" },
      redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) {
      return "Sony's auth endpoint is reachable, so the NPSSO itself is expired or malformed.";
    }
    return `Sony's auth endpoint answered ${response.status} instead of a redirect — a network or proxy is interfering, so the NPSSO may well be fine.`;
  } catch (error) {
    return `Could not reach Sony at all (${(error as Error).message}) — check the network before blaming the NPSSO.`;
  }
}

async function resolveNpsso(argv: string[]): Promise<string> {
  const fromFlag = readOption(argv, "npsso");
  if (fromFlag) {
    return parseNpsso(fromFlag) ?? fail("Could not read an NPSSO out of --npsso.");
  }

  if (hasFlag(argv, "check")) {
    return (
      process.env.PSN_NPSSO ??
      fail("--check needs PSN_NPSSO to be set in .env.local or the environment.")
    );
  }

  console.log(`Sign in to PlayStation, then open:\n  ${SSO_COOKIE_URL}\n`);
  console.log('Paste the value below — the bare cookie or the whole {"npsso":"…"} body.\n');
  const answer = await ask("NPSSO: ");
  return parseNpsso(answer) ?? fail("That did not look like an NPSSO value.");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const npsso = await resolveNpsso(argv);

  heading("Verifying against PSN");

  const accessCode = await exchangeNpssoForCode(npsso).catch(async () => {
    const diagnosis = await diagnoseRejection();
    return fail(
      `PSN would not issue an access code.\n   ${diagnosis}\n   Fresh cookie: ${SSO_COOKIE_URL}`,
    );
  });

  const tokens = await exchangeCodeForAccessToken(accessCode);
  if (!tokens?.accessToken) {
    fail("PSN returned no access token for that NPSSO.");
  }

  const auth = { accessToken: tokens.accessToken };
  const profile = await getProfileFromAccountId(auth, "me").catch(() => null);
  const titles = await getUserTitles(auth, "me").catch(() => null);

  if (profile) {
    done(`Authenticated as ${profile.onlineId}${profile.isPlus ? " (PS Plus)" : ""}`);
  } else {
    warn("Token works, but the profile lookup failed — the widget avatar may stay empty.");
  }

  if (titles) {
    done(`Trophy library reachable: ${titles.trophyTitles.length} titles`);
  } else {
    warn("Token works, but the trophy list could not be read.");
  }

  const expiresOn = new Date(Date.now() + NPSSO_LIFETIME_DAYS * 86_400_000);
  console.log(`\nNPSSO cookies last about ${NPSSO_LIFETIME_DAYS} days.`);
  console.log(`If minted today, expect this one to lapse around ${formatDate(expiresOn)}.`);

  if (hasFlag(argv, "check")) {
    done("PSN_NPSSO is valid — nothing to do.");
    return;
  }

  reportSecret("PSN_NPSSO", npsso, hasFlag(argv, "write"));
}

await main();
