# ⇝credentials

**spotify · playstation · dev-only cli**

Two widget credentials expire on a timer and nothing renews them automatically.
These are the scripts that do it. Dev-only — nothing here ships, nothing here is
imported at runtime.

Both read `.env.local` from the repo root, print the secret they produce, and
only touch the file when you pass `--write`. Writing preserves every other line,
so re-running is safe.

> `--write` updates your local `.env.local` only. Production reads its own env —
> paste the value into the hosting provider's settings too.

*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚

## spotify

```bash
pnpm creds:spotify           # print the token
pnpm creds:spotify --write   # ...and store it
```

Refresh tokens only fall out of the authorization-code flow, so the script opens
the consent screen, catches the redirect on a throwaway loopback server, and
trades the code in. Then it spends the token once to prove it actually refreshes,
and prints which account authorized.

**One-time:** register this redirect URI, verbatim, under Dashboard → your app →
Settings → Redirect URIs.

```
http://127.0.0.1:8888/callback
```

The port is fixed, so this is a one-time step. Spotify rejects `localhost` and
permits plain HTTP only on loopback, hence the IP literal. The docs claim a
portless loopback URI accepts any port — the dashboard refuses to save one, a
[known discrepancy](https://community.spotify.com/t5/Spotify-for-Developers/Loopback-redirect-URI-incorrectly-considered-insecure/td-p/6936119),
so the script does not go near it. If port 8888 is busy, free it and re-run.

`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` come from `.env.local`, or the
prompt if they are missing.

## playstation

```bash
pnpm creds:psn           # paste a cookie, verify it, print it
pnpm creds:psn --write   # ...and store it
pnpm creds:psn --check   # verify what is already in the env
```

Sony mints no NPSSO through an API — it only falls out of a logged-in browser
session. Grab one from https://ca.account.sony.com/api/v1/ssocookie while signed
in and paste either the bare cookie or the whole JSON body; both work.

What the script automates is the verification. It runs the same exchange the
trophy widget does and reports the online ID and trophy-library size, so a dead
cookie fails here instead of in production. When PSN refuses, it probes the auth
endpoint to tell an expired cookie apart from a blocked network — psn-api reports
both with the same message.

NPSSO cookies last about 60 days and nothing renews them, so this comes back
around. `--check` is cheap enough to hang off a reminder.
