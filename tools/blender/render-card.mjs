#!/usr/bin/env node
/**
 * Render holo card layers with Blender, then crop and convert them for the site.
 *
 *   pnpm holo:render --name mycard [--model model.glb] [--palette all] [--variants 3] [--publish]
 *   pnpm holo:render --name mycard --blend scene.blend
 *
 * Finds Blender (BLENDER env, PATH, or the usual install locations), runs
 * `render_card.py` headless, then with sharp crops the photo, cut-out and depth
 * map from the overhang frame to the card, keeps the effects layer at the full
 * frame, and writes WebPs plus a manifest. `--publish` also copies the WebPs
 * to `apps/portfolio/public/images/holo/<variant>/`.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const PUBLIC_DIR = path.join(repoRoot, "apps/portfolio/public/images/holo");

/** Flags the Python side understands; everything else is handled here. */
const PY_FLAGS = new Set([
  "name",
  "model",
  "palette",
  "variants",
  "seed",
  "width",
  "height",
  "overscan",
  "samples",
  "engine",
  "shards",
  "sparkles",
]);

export function parseArgs(argv) {
  const options = { name: "card", out: "", blend: "", blender: "", publish: false, python: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    if (key === "publish") {
      options.publish = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${key} needs a value`);
    }
    i++;
    if (key === "out" || key === "blend" || key === "blender") {
      options[key] = value;
    } else if (key === "name") {
      options.name = value;
      options.python.name = value;
    } else if (PY_FLAGS.has(key)) {
      options.python[key] = value;
    } else {
      throw new Error(`unknown flag --${key}`);
    }
  }
  options.out ||= path.join(repoRoot, "tools/blender/out", options.name);
  return options;
}

export function candidateBlenderPaths(env = process.env, platform = process.platform) {
  const candidates = [];
  if (env.BLENDER) {
    candidates.push(env.BLENDER);
  }
  if (platform === "darwin") {
    candidates.push("/Applications/Blender.app/Contents/MacOS/Blender");
  } else if (platform === "win32") {
    candidates.push("C:\\Program Files\\Blender Foundation\\Blender\\blender.exe");
  } else {
    candidates.push("/usr/bin/blender", "/usr/local/bin/blender", "/snap/bin/blender");
  }
  return candidates;
}

async function findBlender(explicit) {
  if (explicit) {
    return explicit;
  }
  for (const candidate of candidateBlenderPaths()) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  // last resort: whatever `blender` resolves to on PATH
  return "blender";
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

export function pythonArgs(options) {
  const args = ["--out", options.out];
  for (const [key, value] of Object.entries(options.python)) {
    args.push(`--${key}`, String(value));
  }
  return args;
}

async function loadSharp() {
  // sharp is a dependency of the portfolio app; resolve it from there.
  const require = createRequire(path.join(repoRoot, "apps/portfolio/package.json"));
  try {
    return require("sharp");
  } catch {
    return null;
  }
}

/** Centre crop of the card inside the overhang frame. */
export function cardRegion(manifest) {
  const left = Math.round((manifest.frame.width - manifest.card.width) / 2);
  const top = Math.round((manifest.frame.height - manifest.card.height) / 2);
  return { left, top, width: manifest.card.width, height: manifest.card.height };
}

async function convertVariant(sharp, dir, manifest) {
  const region = cardRegion(manifest);
  const outputs = {};
  const jobs = [
    ["photo", manifest.files.photo, `${manifest.name}.webp`, true, { quality: 86 }],
    ["foreground", manifest.files.foreground, `${manifest.name}-fg.webp`, true, { quality: 90 }],
    ["effects", manifest.files.effects, `${manifest.name}-fx.webp`, false, { quality: 90 }],
    ["depth", manifest.files.depth, `${manifest.name}-depth.webp`, true, { nearLossless: true }],
  ];
  for (const [kind, source, target, crop, webp] of jobs) {
    const input = path.join(dir, source);
    if (!existsSync(input)) {
      console.warn(`[holo] missing ${source}, skipped`);
      continue;
    }
    let image = sharp(input);
    if (crop) {
      image = image.extract(region);
    }
    if (kind === "depth") {
      image = image.toColourspace("b-w");
    }
    await image.webp(webp).toFile(path.join(dir, target));
    const { size } = await stat(path.join(dir, target));
    outputs[kind] = { file: target, bytes: size };
  }
  const next = { ...manifest, webp: outputs };
  await writeFile(path.join(dir, `${manifest.name}.json`), JSON.stringify(next, null, 2));
  return next;
}

async function publishVariant(dir, manifest) {
  const target = path.join(PUBLIC_DIR, path.basename(dir));
  await mkdir(target, { recursive: true });
  for (const { file } of Object.values(manifest.webp)) {
    await copyFile(path.join(dir, file), path.join(target, file));
  }
  await copyFile(
    path.join(dir, `${manifest.name}.json`),
    path.join(target, `${manifest.name}.json`),
  );
  return path.relative(repoRoot, target);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const blender = await findBlender(options.blender);
  const script = path.join(here, "render_card.py");
  const args = ["--background"];
  if (options.blend) {
    args.push(path.resolve(options.blend));
  }
  args.push("--python", script, "--", ...pythonArgs(options));
  console.log(`[holo] ${blender} ${args.join(" ")}`);
  await run(blender, args);

  const index = JSON.parse(await readFile(path.join(options.out, "index.json"), "utf8"));
  const sharp = await loadSharp();
  if (!sharp) {
    console.warn(
      "[holo] sharp not found (pnpm install in the repo root); PNGs are left uncropped.",
    );
    return;
  }
  const dirs = (await readdir(options.out, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(options.out, entry.name));
  const rows = [];
  for (const manifest of index.variants) {
    const dir = dirs.find(
      (candidate) =>
        existsSync(path.join(candidate, `${manifest.name}.json`)) &&
        candidate.endsWith(variantSuffix(manifest, index.variants.length)),
    );
    if (!dir) {
      console.warn(`[holo] no folder for variant ${manifest.palette}`);
      continue;
    }
    const converted = await convertVariant(sharp, dir, manifest);
    const published = options.publish ? await publishVariant(dir, converted) : "";
    rows.push({
      variant: path.basename(dir),
      palette: manifest.palette,
      photo: `${Math.round(converted.webp.photo?.bytes / 1024)} KB`,
      fg: `${Math.round(converted.webp.foreground?.bytes / 1024)} KB`,
      fx: `${Math.round(converted.webp.effects?.bytes / 1024)} KB`,
      depth: `${Math.round(converted.webp.depth?.bytes / 1024)} KB`,
      published,
    });
  }
  console.table(rows);
  console.log(
    "[holo] upload the WebPs to Storyblok and set them on a holo_image blok: image, Foreground Cut-out, Effects Layer, Depth Map. Or use --publish and reference /images/holo/<variant>/ from a story.",
  );
}

function variantSuffix(manifest, count) {
  return count === 1 ? manifest.name : `${manifest.name}-${manifest.palette}-${manifest.seed}`;
}

const isEntry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntry) {
  main().catch((error) => {
    console.error(`[holo] ${error.message}`);
    process.exit(1);
  });
}
