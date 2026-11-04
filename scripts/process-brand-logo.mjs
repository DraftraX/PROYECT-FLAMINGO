import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgDarkPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo.svg');
const svgLightPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo-light.svg');
const outputDarkTextPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo.png');
const outputLightTextPath = path.join(rootDir, 'public', 'brand', 'logo-flamingo-light.png');

async function launchBrowser() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ headless: true, channel });
    } catch {
      // try next
    }
  }
  return await chromium.launch({ headless: true });
}

async function renderSvgToPng(browser, svgPath, outPath) {
  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1040 },
    deviceScaleFactor: 2,
  });

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 1080px;
      height: 1040px;
      background: transparent !important;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    svg {
      width: 1080px;
      height: 1040px;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const rawBuffer = await page.screenshot({
    type: 'png',
    omitBackground: true,
  });
  await page.close();

  // Trim extra transparent border and add a clean 28px padding
  const trimmed = await sharp(rawBuffer)
    .trim({ threshold: 2 })
    .extend({
      top: 28,
      bottom: 28,
      left: 36,
      right: 36,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize({ width: 960, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });

  await fs.promises.writeFile(outPath, trimmed.data);
  return trimmed.info;
}

async function processLogo() {
  if (!fs.existsSync(svgDarkPath) || !fs.existsSync(svgLightPath)) {
    throw new Error('No se encontraron los archivos SVG vectoriales en public/brand/');
  }

  const browser = await launchBrowser();
  try {
    const darkInfo = await renderSvgToPng(browser, svgDarkPath, outputDarkTextPath);
    const lightInfo = await renderSvgToPng(browser, svgLightPath, outputLightTextPath);

    // Clean up temporary file if present
    const tempIcon = path.join(rootDir, 'public', 'brand', 'flamingo-icon-hd.png');
    if (fs.existsSync(tempIcon)) {
      fs.unlinkSync(tempIcon);
    }

    console.log('[Brand Logo] Reconstruido en ultra alta definición sin fondo:');
    console.log(` - Principal (sobre lavanda): ${outputDarkTextPath} (${darkInfo.width}x${darkInfo.height})`);
    console.log(` - Versión clara (sobre ciruela/oliva): ${outputLightTextPath} (${lightInfo.width}x${lightInfo.height})`);
  } finally {
    await browser.close();
  }
}

processLogo().catch((err) => {
  console.error('[Brand Logo] Error:', err);
  process.exit(1);
});
