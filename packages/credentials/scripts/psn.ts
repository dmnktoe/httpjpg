#!/usr/bin/env tsx

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env.local"), quiet: true });

import { banner, done, fail, heading, step, warn } from "@httpjpg/cli-style";
// oxlint-disable-next-line import/default
import psnApi from "psn-api";

import { ask, hasFlag, readOption, reportSecret } from "./lib/cli";
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
      return "sony is reachable · the npsso itself is expired or malformed";
    }
    return `sony answered ${response.status} instead of a redirect · a network or proxy is interfering, the npsso may be fine`;
  } catch (error) {
    return `sony unreachable (${(error as Error).message}) · check the network before blaming the npsso`;
  }
}

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

  const expiresOn = new Date(Date.now() + NPSSO_LIFETIME_DAYS * 86_400_000);
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
