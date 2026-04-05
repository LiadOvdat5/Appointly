import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/icons/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
];

for (const { size, file } of sizes) {
  const outPath = resolve(__dirname, `../public/icons/${file}`);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${file} (${size}x${size})`);
}

console.log('All PWA icons generated.');
