import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR =
  process.env.ARTIFACT_DIR ||
  'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\f0f3ddeb-3217-4099-9725-bf56adef71e7';
const PORT = 4355;
const LOCAL_URL = process.env.VERIFY_URL || `http://localhost:${PORT}/`;

async function launchBrowser() {
  for (const channel of ['chrome', 'msedge', undefined]) {
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      // try next channel
    }
  }
  throw new Error('Could not launch Chromium/Chrome/Edge');
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function runVerification() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const server = spawn(process.execPath, ['./node_modules/astro/astro.js', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
  });

  const browser = await launchBrowser();

  try {
    await waitForServer(LOCAL_URL);
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

    // 1. Test Menu Toggle (the exact trigger that previously caused NotFoundError: insertBefore)
    const menuBtn = page.locator('header button[aria-label*="menú"]');
    await menuBtn.click();
    await page.waitForTimeout(350);
    const menuDrawerShot = path.join(ARTIFACT_DIR, 'verify_menu_drawer.png');
    await page.screenshot({ path: menuDrawerShot });
    await menuBtn.click();
    await page.waitForTimeout(350);

    // 2. Scroll progressive steps inside the pinned section & toggle menu while pinned
    const pinnedHeight = await page.evaluate(() => {
      const sec = document.getElementById('preventa-scroll-stage');
      return sec ? sec.offsetHeight - window.innerHeight : 3000;
    });

    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: 'instant' }),
      Math.round(pinnedHeight * 0.38)
    );
    await page.waitForTimeout(500);
    await menuBtn.click();
    await page.waitForTimeout(250);
    await menuBtn.click();
    await page.waitForTimeout(250);

    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: 'instant' }),
      Math.round(pinnedHeight * 0.72)
    );
    await page.waitForTimeout(500);

    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: 'instant' }),
      Math.round(pinnedHeight * 0.98)
    );
    await page.waitForTimeout(500);

    // 3. Test RealProjectShowcase video toggle & zone tabs
    await page.evaluate(() => {
      document.getElementById('proyecto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(400);
    const toggleVideoBtn = page.locator('button', { hasText: /Ver Video de Transformación/i });
    if (await toggleVideoBtn.count()) {
      await toggleVideoBtn.click();
      await page.waitForTimeout(400);
      const backBtn = page.locator('button', { hasText: /Volver al Comparador/i });
      await backBtn.click();
      await page.waitForTimeout(300);
    }

    // 4. Test Lot Selector & 360 viewer
    await page.evaluate(() => {
      document.getElementById('plano-lotes')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);

    // 5. Scroll to Contact & Footer and verify updated contact info
    await page.evaluate(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const contactScreenshot = path.join(ARTIFACT_DIR, 'verify_contact_footer.png');
    await page.screenshot({ path: contactScreenshot, fullPage: false });

    const contactCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const html = document.body.innerHTML;
      return {
        hasPhone: text.includes('+51 989 195 093'),
        hasWaLink: html.includes('https://wa.me/51989195093'),
        hasEmail: text.includes('aurora.aybar@gmail.com'),
        hasInstagram: html.includes('https://www.instagram.com/inmobiliaria.flamingo/'),
        hasFacebook: html.includes('https://www.facebook.com/profile.php?id=61583317215238'),
        hasHandle: text.includes('@ResidencialFlamingo'),
      };
    });
    console.log('[Playwright] Verificación de datos de contacto:', contactCheck);

    console.log(`[Playwright] Errores de consola: ${consoleErrors.length}`);
    console.log(`[Playwright] Excepciones de página: ${pageErrors.length}`);

    if (
      consoleErrors.length > 0 ||
      pageErrors.length > 0 ||
      !contactCheck.hasPhone ||
      !contactCheck.hasWaLink ||
      !contactCheck.hasEmail ||
      !contactCheck.hasInstagram ||
      !contactCheck.hasFacebook
    ) {
      console.error('Detalles de fallos:', { consoleErrors, pageErrors, contactCheck });
      process.exitCode = 1;
    } else {
      console.log('[Playwright] ¡VERIFICACIÓN EXITOSA CON CERO ERRORES EN CONSOLA!');
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

runVerification().catch((err) => {
  console.error('[Playwright] Error fatal:', err);
  process.exit(1);
});
