# @httpjpg/credentials

Two CLIs for the widget credentials that expire on a timer. Dev-only — nothing
here is imported at runtime or deployed.

Both scripts read `.env.local` from the repo root, print the resulting secret,
and only touch the file when you pass `--write`. Writing preserves every other
line, so it is safe to re-run.

> `--write` only updates your local `.env.local`. The value still has to be
> pasted into the hosting provider's env settings for production to pick it up.

## Spotify — `SPOTIFY_REFRESH_TOKEN`

```bash
pnpm creds:spotify           # print the token
pnpm creds:spotify --write   # ...and store it in .env.local
pnpm creds:spotify --port 0  # let the OS pick a free port
```

Refresh tokens only come out of Spotify's authorization-code flow, so the script
opens the consent screen, catches the redirect on a throwaway loopback server,
and trades the code in. It then spends the token once to prove it actually
refreshes, and prints which account authorized.

**One-time setup:** register a redirect URI under Dashboard → your app →
Settings → Redirect URIs. Spotify treats loopback literals specially — a
registration without a port accepts any port, which is the one to prefer:

```
http://127.0.0.1/callback        # portless: works with any --port, including 0
http://127.0.0.1:8888/callback   # exact: only works on the default port
```

Two rules Spotify enforces on the redirect URI, both of which the script already
satisfies: `localhost` is rejected, so it has to be the IP literal, and non-HTTPS
is only permitted for loopback addresses.

The script prints the URI it is listening on before opening the browser, so a
mismatch is visible before you authorize rather than after. If the default port
is taken, `--port 0` sidesteps it — that only works with the portless
registration, since the port is not known until the server has bound.

`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are read from `.env.local`, or
prompted for if missing.

## PlayStation — `PSN_NPSSO`

```bash
pnpm creds:psn           # paste a cookie, verify it, print it
pnpm creds:psn --write   # ...and store it in .env.local
pnpm creds:psn --check   # verify the value already in the env
pnpm creds:psn --npsso '{"npsso":"…"}'
```

Sony has no API that mints an NPSSO — it only falls out of a logged-in browser
session, so grab one from https://ca.account.sony.com/api/v1/ssocookie while
signed in. Paste either the bare cookie or the whole JSON body; the script takes
both.

What it automates is the verification: it runs the same exchange the trophy
widget does and reports the online ID and trophy-library size, so a dead cookie
fails here instead of in production. When PSN refuses, it probes the auth
endpoint to tell an expired cookie apart from a network or proxy problem — the
two are indistinguishable in psn-api's own error message.

NPSSO cookies last about 60 days and nothing renews them automatically, so this
is a recurring chore. `--check` is cheap enough to run from a reminder.
