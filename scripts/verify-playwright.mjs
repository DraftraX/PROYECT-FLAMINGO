import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR =
  'C:\\Users\\manuel\\.gemini\\antigravity\\brain\\36a444bb-5fc1-4016-a703-3cc60cf514f0';
const LOCAL_URL = process.env.VERIFY_URL || 'http://localhost:4321/';

async function runVerification() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    // =========================================================================
    // 1. DESKTOP VERIFICATION (1440x900)
    // =========================================================================
    console.log('[Playwright] Iniciando verificación Desktop (1440x900)...');
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await desktopCtx.newPage();

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);

    // Check fonts and canvas
    const initialMetrics = await page.evaluate(async () => {
      await document.fonts.ready;
      const canvas = document.querySelector('canvas');
      const h1 = document.querySelector('h1');
      const h1Font = h1 ? window.getComputedStyle(h1).fontFamily : '';
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      return {
        title: document.title,
        h1Text: h1?.textContent?.trim(),
        h1Font,
        bodyFont,
        canvasWidth: canvas?.width || 0,
        canvasHeight: canvas?.height || 0,
      };
    });
    console.log('[Playwright] Métricas iniciales Desktop:', initialMetrics);

    // Simulate mousemove parallax over Hero & Canvas
    await page.mouse.move(320, 260, { steps: 10 });
    await page.waitForTimeout(250);
    await page.mouse.move(1120, 620, { steps: 12 });
    await page.waitForTimeout(300);

    // Screenshot 1: Scroll 0% (Hero con máscara de ala de flamenco y plumas en parallax)
    const desktopHeroPath = path.join(ARTIFACT_DIR, 'verify_desktop_00_hero.png');
    await page.screenshot({ path: desktopHeroPath });
    console.log('[Playwright] Captura guardada:', desktopHeroPath);

    // Scroll progressive steps inside the 450vh pinned section
    const pinnedHeight = await page.evaluate(() => {
      const sec = document.getElementById('preventa-scroll-stage');
      return sec ? sec.offsetHeight - window.innerHeight : 3000;
    });

    // Step 2: 38% of pinned stage (Tramo 2 — Agua, Desagüe, Alumbrado Público)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(pinnedHeight * 0.38));
    await page.waitForTimeout(700);
    const desktopTramo2Path = path.join(ARTIFACT_DIR, 'verify_desktop_38_services.png');
    await page.screenshot({ path: desktopTramo2Path });
    console.log('[Playwright] Captura guardada:', desktopTramo2Path);

    // Step 3: 72% of pinned stage (Tramo 3 — Ubicación a 30m del Colegio Virgen Dolorosa)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(pinnedHeight * 0.72));
    await page.waitForTimeout(700);
    const desktopTramo3Path = path.join(ARTIFACT_DIR, 'verify_desktop_72_location.png');
    await page.screenshot({ path: desktopTramo3Path });
    console.log('[Playwright] Captura guardada:', desktopTramo3Path);

    // Step 4: 98% of pinned stage (Tramo 4 — Golden Hour Lotización Consolidada)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(pinnedHeight * 0.98));
    await page.waitForTimeout(700);
    const desktopTramo4Path = path.join(ARTIFACT_DIR, 'verify_desktop_98_goldenhour.png');
    await page.screenshot({ path: desktopTramo4Path });
    console.log('[Playwright] Captura guardada:', desktopTramo4Path);

    // Step 5: Interactive Lot Selector Section (#plano-lotes)
    await page.evaluate(() => {
      document.getElementById('plano-lotes')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    const desktopLotsPath = path.join(ARTIFACT_DIR, 'verify_desktop_lots_module.png');
    await page.screenshot({ path: desktopLotsPath });
    console.log('[Playwright] Captura guardada:', desktopLotsPath);

    // =========================================================================
    // 2. MOBILE VERIFICATION (390x844)
    // =========================================================================
    console.log('[Playwright] Iniciando verificación Mobile (390x844)...');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Mobile] ${msg.text()}`);
      }
    });
    mobilePage.on('pageerror', (err) => {
      pageErrors.push(`[Mobile] ${err.message}`);
    });

    await mobilePage.goto(LOCAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(800);

    const mobileHeroPath = path.join(ARTIFACT_DIR, 'verify_mobile_00_hero.png');
    await mobilePage.screenshot({ path: mobileHeroPath });
    console.log('[Playwright] Captura Mobile Hero guardada:', mobileHeroPath);

    await mobilePage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), 1400);
    await mobilePage.waitForTimeout(700);
    const mobileMidPath = path.join(ARTIFACT_DIR, 'verify_mobile_50_construction.png');
    await mobilePage.screenshot({ path: mobileMidPath });
    console.log('[Playwright] Captura Mobile Construcción guardada:', mobileMidPath);

    console.log(`[Playwright] Errores de consola: ${consoleErrors.length}`);
    console.log(`[Playwright] Excepciones de página: ${pageErrors.length}`);

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      console.error('Detalles de errores:', { consoleErrors, pageErrors });
      process.exitCode = 1;
    } else {
      console.log('[Playwright] ¡VERIFICACIÓN EXITOSA CON CERO ERRORES EN CONSOLA!');
    }
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error('[Playwright] Error fatal:', err);
  process.exit(1);
});
