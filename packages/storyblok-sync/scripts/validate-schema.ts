#!/usr/bin/env tsx

import { banner, done, fail, outro, warn } from "@httpjpg/terminal";

import { allBlocks } from "./lib/schema";
import { validateLocalSchema } from "./lib/validate";

function validate(): void {
  banner("storyblok · schema validation");

  const blocks = allBlocks();
  const { ok, issues } = validateLocalSchema(blocks);

  for (const issue of issues) {
    const where = issue.path.length > 0 ? ` · ${issue.path.join(".")}` : "";
    warn(`${issue.entity}${where} · ${issue.code} · ${issue.message}`);
  }

  if (!ok) {
    fail(`${issues.filter((i) => i.severity === "error").length} schema error(s)`);
    return;
  }

  done(`${blocks.length} blocks valid`);
  outro("schema validation complete");
}

validate();
