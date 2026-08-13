import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.STORYBOOK_STATIC_PORT) || 6007;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../storybook-static");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const candidate = path.resolve(ROOT, `.${path.posix.normalize(decoded)}`);

  // Anything that escapes the build directory is a 404, not a file read.
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${path.sep}`)) {
    return null;
  }

  try {
    const stats = statSync(candidate);
    if (stats.isDirectory()) {
      const index = path.join(candidate, "index.html");
      return statSync(index).isFile() ? index : null;
    }
    return stats.isFile() ? candidate : null;
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  const file = resolveFile(request.url ?? "/");

  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": MIME_TYPES[path.extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});

server.listen(PORT, "127.0.0.1", () => {
  console.warn(`storybook-static served on http://127.0.0.1:${PORT}`);
});
