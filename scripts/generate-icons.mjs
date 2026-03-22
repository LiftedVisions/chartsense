import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const ACCENT = "#4f8ef7";
const RING = "#3a7bd5";

/**
 * @param {number} sizePx - canvas size (square)
 * @param {number} fontSizePx
 */
function buildPngSvg(sizePx, fontSizePx) {
  const cx = sizePx / 2;
  const cy = sizePx / 2;
  const r = sizePx * 0.46;
  const strokeW = Math.max(2, Math.round(sizePx * 0.018));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${ACCENT}" stroke="${RING}" stroke-width="${strokeW}"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="${fontSizePx}">CS</text>
</svg>`;
}

function buildFaviconSvg() {
  const cx = 50;
  const cy = 50;
  const r = 46;
  const strokeW = 1.8;
  const fontSize = 38;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${ACCENT}" stroke="${RING}" stroke-width="${strokeW}"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="${fontSize}">CS</text>
</svg>
`;
}

async function main() {
  const icon192 = join(publicDir, "icon-192.png");
  const icon512 = join(publicDir, "icon-512.png");
  const faviconPath = join(publicDir, "favicon.svg");

  const svg192 = buildPngSvg(192, 72);
  const svg512 = buildPngSvg(512, 192);

  await sharp(Buffer.from(svg192)).resize(192).png().toFile(icon192);
  await sharp(Buffer.from(svg512)).resize(512).png().toFile(icon512);

  writeFileSync(faviconPath, buildFaviconSvg(), "utf8");

  console.log("Wrote:", icon192, icon512, faviconPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
