// @vitest-environment node

import { afterEach, beforeEach, vi } from "vitest";

import { ASCII_DIVIDER_DOTS, ASCII_DIVIDER_STARS, ASCII_SPARKLES } from "./ascii";
import { banner, done, fail, heading, note, outro, step, warn } from "./output";

let out: string[];
let err: string[];

beforeEach(() => {
  out = [];
  err = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    out.push(args.join(" "));
  });
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    err.push(args.join(" "));
  });
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    err.push(args.join(" "));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("banner", () => {
  it("frames the title with the star divider", () => {
    banner("psn · npsso");

    expect(out).toHaveLength(3);
    expect(out[0]).toContain(ASCII_DIVIDER_STARS);
    expect(out[1]).toContain("⇝");
    expect(out[1]).toContain("psn · npsso");
    expect(out[2]).toContain(ASCII_DIVIDER_STARS);
  });
});

describe("heading", () => {
  it("puts the arrow title over a dotted rule", () => {
    heading("verifying");

    expect(out[0]).toContain("⇝");
    expect(out[0]).toContain("verifying");
    expect(out[1]).toContain(ASCII_DIVIDER_DOTS);
  });
});

describe("step, done, warn, note", () => {
  it("marks each level distinctly and keeps the message", () => {
    step("reaching out");
    done("authenticated");
    note("heads up");

    expect(out[0]).toContain("·");
    expect(out[0]).toContain("reaching out");
    expect(out[1]).toContain("✦");
    expect(out[1]).toContain("authenticated");
    expect(out[2]).toContain("heads up");
  });

  it("sends warnings to stderr, not stdout", () => {
    warn("avatar may stay empty");

    expect(out).toHaveLength(0);
    expect(err[0]).toContain("!");
    expect(err[0]).toContain("avatar may stay empty");
  });
});

describe("outro", () => {
  it("signs off with sparkles", () => {
    outro();

    expect(out.at(-1)).toContain(ASCII_SPARKLES);
  });

  it("prints the closing message above the sparkles when given one", () => {
    outro("all set");

    expect(out[0]).toContain("all set");
    expect(out.at(-1)).toContain(ASCII_SPARKLES);
  });
});

describe("fail", () => {
  it("writes to stderr and exits non-zero so pipelines notice", () => {
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    expect(() => fail("no access code")).toThrow("exit");

    expect(exit).toHaveBeenCalledWith(1);
    expect(err[0]).toContain("∅");
    expect(err[0]).toContain("no access code");
    expect(err[1]).toContain(ASCII_DIVIDER_DOTS);
    expect(out).toHaveLength(0);
  });
});
