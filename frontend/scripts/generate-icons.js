import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, "../public/pwa-icon.svg");
const output192 = join(__dirname, "../public/pwa-192x192.png");
const output512 = join(__dirname, "../public/pwa-512x512.png");

const svgBuffer = readFileSync(svgPath);

// Generate 192x192 PNG
await sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile(output192);

console.log("✓ Generated pwa-192x192.png");

// Generate 512x512 PNG
await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile(output512);

console.log("✓ Generated pwa-512x512.png");
