#!/usr/bin/env node
// One-off generator: builds every app icon asset from public/logo.png.
// Re-run this whenever the source logo changes — the outputs are committed
// files (app/icon.png, app/apple-icon.png, public/icon-192.png,
// public/icon-512.png), not generated at request time.
//
//   node scripts/generate-icons.mjs

import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "logo.png");

// The logo's own transparent background carries this RGB under alpha=0 —
// using it exactly keeps the icon backgrounds a perfect match to the mark's
// intended dark navy, rather than a guessed approximation.
const NAVY = { r: 17, g: 7, b: 32, alpha: 1 };

async function makeIcon(outPath, size, paddingRatio) {
  const trimmed = await sharp(SRC).trim().toBuffer();
  const contentSize = Math.round(size * (1 - paddingRatio * 2));

  const resizedMark = await sharp(trimmed)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const offset = Math.round((size - contentSize) / 2);

  await sharp({
    create: { width: size, height: size, channels: 4, background: NAVY },
  })
    .composite([{ input: resizedMark, left: offset, top: offset }])
    .png()
    .toFile(outPath);

  console.log(`wrote ${path.relative(ROOT, outPath)} (${size}x${size})`);
}

async function main() {
  // Favicon — smaller canvas, slightly tighter padding so the mark still
  // reads clearly at browser-tab size.
  await makeIcon(path.join(ROOT, "app", "icon.png"), 32, 0.12);
  // iOS home screen.
  await makeIcon(path.join(ROOT, "app", "apple-icon.png"), 180, 0.18);
  // Android/PWA manifest icons.
  await makeIcon(path.join(ROOT, "public", "icon-192.png"), 192, 0.18);
  await makeIcon(path.join(ROOT, "public", "icon-512.png"), 512, 0.18);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
