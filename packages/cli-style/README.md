# ⇝cli-style

**ascii · truecolor · dev-only**

Shared terminal voice for the repo's dev CLIs, so `creds:psn` and `sync:components`
read as the same tool. Dev-only — nothing here ships to the browser.

Colours are derived from `@httpjpg/tokens`, the same source Panda consumes, so a
palette change reaches the terminal too. Nothing is hardcoded.

*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚

## output

```ts
import { banner, heading, step, done, warn, fail, outro } from "@httpjpg/cli-style";

banner("psn · npsso");
heading("verifying");
step("reaching out to sony");
done("authenticated");
warn("avatar may stay empty");
fail("no access code");
outro("all set");
```

| helper    | mark                           | colour  |
| --------- | ------------------------------ | ------- |
| `banner`  | `⇝` framed by the star divider | accent  |
| `heading` | `⇝` over a dotted rule         | accent  |
| `step`    | `·`                            | dim     |
| `done`    | `✦`                            | success |
| `warn`    | `!`                            | warning |
| `fail`    | `∅`, then `exit(1)`            | danger  |
| `outro`   | sparkle sign-off               | accent  |

`fail` returns `never` — it exits non-zero, so scripts stay pipeline-safe.

## colour

Colour is off automatically when stdout is not a TTY, when `NO_COLOR` is set, or
under `TERM=dumb` — piping or redirecting output yields clean text.

```ts
import { accent, primary, success, warning, danger, muted, bold, dim } from "@httpjpg/cli-style";
```

## house rules

Lowercase messages, `·` as the separator, no emoji — the marks above carry the
status. Anything user-facing goes through these helpers rather than a bare
`console.log`, so one change restyles every CLI at once.
