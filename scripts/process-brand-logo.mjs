import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo-raw.png');
const outputDarkTextPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo.png');
const outputLightTextPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo-light.png');

async function processLogo() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`No se encontró el archivo base en ${inputPath}`);
  }

  // Upscale 4x with Lanczos3 and slight blur/sharpen to eliminate JPEG compression artifacts
  const upscaled = sharp(inputPath)
    .resize(900, 900, { kernel: sharp.kernel.lanczos3 })
    .blur(0.8)
    .sharpen({ sigma: 1.1 });

  const { data, info } = await upscaled
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample background color from top-left corner (#E5DEF0 ~ R:229, G:222, B:240)
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const darkBuf = Buffer.from(data);
  const lightBuf = Buffer.from(data);

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );

      const isTypographyZone = y > info.height * 0.635;
      const minThreshold = isTypographyZone ? 46 : 30;
      const maxThreshold = isTypographyZone ? 95 : 78;

      let alpha = 0;
      if (dist <= minThreshold) {
        alpha = 0;
      } else if (dist < maxThreshold) {
        const t = (dist - minThreshold) / (maxThreshold - minThreshold);
        alpha = Math.round(t * t * 255);
      } else {
        alpha = 255;
      }

      darkBuf[idx + 3] = alpha;
      lightBuf[idx + 3] = alpha;

      if (alpha > 32) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      if (alpha > 0) {
        if (isTypographyZone) {
          // Force crisp brand plum (#361D42 = 54, 29, 66) for dark logo text
          darkBuf[idx] = 54;
          darkBuf[idx + 1] = 29;
          darkBuf[idx + 2] = 66;

          // Force crisp silk lavender (#F5F1FA = 245, 241, 250) for light logo text
          lightBuf[idx] = 245;
          lightBuf[idx + 1] = 241;
          lightBuf[idx + 2] = 250;
        } else if (alpha < 255) {
          // Un-matte flamingo edges against lavender background
          const aNorm = Math.max(0.25, alpha / 255);
          const cleanR = Math.max(0, Math.min(255, Math.round((r - bgR * (1 - aNorm)) / aNorm)));
          const cleanG = Math.max(0, Math.min(255, Math.round((g - bgG * (1 - aNorm)) / aNorm)));
          const cleanB = Math.max(0, Math.min(255, Math.round((b - bgB * (1 - aNorm)) / aNorm)));
          darkBuf[idx] = cleanR;
          darkBuf[idx + 1] = cleanG;
          darkBuf[idx + 2] = cleanB;
          lightBuf[idx] = cleanR;
          lightBuf[idx + 1] = cleanG;
          lightBuf[idx + 2] = cleanB;
        }
      }
    }
  }

  const pad = 20;
  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, minY - pad);
  const cropWidth = Math.min(info.width - cropLeft, maxX - minX + pad * 2);
  const cropHeight = Math.min(info.height - cropTop, maxY - minY + pad * 2);

  await sharp(darkBuf, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png({ compressionLevel: 9 })
    .toFile(outputDarkTextPath);

  await sharp(lightBuf, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png({ compressionLevel: 9 })
    .toFile(outputLightTextPath);

  console.log(`[Brand Logo] Procesado con éxito sin artefactos:`);
  console.log(` - Principal (sobre lavanda): ${outputDarkTextPath} (${cropWidth}x${cropHeight})`);
  console.log(` - Versión clara (sobre ciruela/oliva): ${outputLightTextPath} (${cropWidth}x${cropHeight})`);
}

processLogo().catch((err) => {
  console.error('[Brand Logo] Error:', err);
  process.exit(1);
});
