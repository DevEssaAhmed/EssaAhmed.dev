import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(scriptDir, "../public");
const svg = await readFile(path.join(publicDir, "favicon.svg"));

async function renderPng(size, filename) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(path.join(publicDir, filename), png);
  return png;
}

const faviconSizes = [16, 32, 48, 64];
const icoImages = await Promise.all(
  faviconSizes.map((size) => renderPng(size, `favicon-${size}x${size}.png`)),
);

await Promise.all([
  renderPng(96, "favicon-96x96.png"),
  renderPng(180, "apple-touch-icon.png"),
  renderPng(192, "android-chrome-192x192.png"),
  renderPng(512, "android-chrome-512x512.png"),
]);

const headerSize = 6;
const entrySize = 16;
const directorySize = headerSize + entrySize * icoImages.length;
let imageOffset = directorySize;
const ico = Buffer.alloc(directorySize + icoImages.reduce((sum, image) => sum + image.length, 0));

ico.writeUInt16LE(0, 0);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(icoImages.length, 4);

for (let i = 0; i < icoImages.length; i += 1) {
  const image = icoImages[i];
  const size = faviconSizes[i];
  const entryOffset = headerSize + i * entrySize;

  ico.writeUInt8(size === 256 ? 0 : size, entryOffset);
  ico.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
  ico.writeUInt8(0, entryOffset + 2);
  ico.writeUInt8(0, entryOffset + 3);
  ico.writeUInt16LE(1, entryOffset + 4);
  ico.writeUInt16LE(32, entryOffset + 6);
  ico.writeUInt32LE(image.length, entryOffset + 8);
  ico.writeUInt32LE(imageOffset, entryOffset + 12);
  image.copy(ico, imageOffset);
  imageOffset += image.length;
}

await writeFile(path.join(publicDir, "favicon.ico"), ico);
console.log("Generated favicon PNG, ICO, Apple touch, and Android icon assets.");
