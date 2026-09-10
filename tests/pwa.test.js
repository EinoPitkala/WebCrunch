import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("manifest provides standalone app metadata and install icons", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));

  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#21071b");

  const iconSizes = new Set(manifest.icons.map((icon) => icon.sizes));
  assert(iconSizes.has("192x192"));
  assert(iconSizes.has("512x512"));

  for (const icon of manifest.icons) {
    assert(existsSync(resolve(root, icon.src)), `Missing manifest icon: ${icon.src}`);
  }
});

test("document advertises the manifest and service worker caches valid files", () => {
  const html = read("index.html");
  const worker = read("service-worker.js");
  const shellMatch = worker.match(/const APP_SHELL = (\[[\s\S]*?\]);/);

  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert(shellMatch, "Service worker must declare an APP_SHELL array");

  const shell = JSON.parse(shellMatch[1]);
  assert(shell.includes("./manifest.webmanifest"));
  assert(shell.includes("./src/pwa.js"));

  for (const asset of shell.filter((path) => path !== "./")) {
    assert(existsSync(resolve(root, asset)), `Missing cached asset: ${asset}`);
  }
});
