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

  const server = spawn(
    process.execPath,
    ['./node_modules/astro/astro.js', 'preview', '--port', String(PORT)],
    { stdio: 'pipe' }
  );

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

    // 1. Test Menu Toggle
    const menuBtn = page.locator('header button[aria-label*="menú"]');
    await menuBtn.click();
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_menu_drawer.png') });
    await menuBtn.click();
    await page.waitForTimeout(350);

    // 2. Scroll to "Nosotros" (Reconstructed HD Logo + Manifesto)
    await page.evaluate(() => {
      document.getElementById('nosotros')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_nosotros_logo.png') });

    // 3. Scroll to Tarapoto & Cordillera Escalera Documentary Video Showcase
    await page.evaluate(() => {
      document.getElementById('tarapoto-video')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    const chBtn = page.locator('button', { hasText: /Dron Real Flamingo/i });
    if (await chBtn.count()) {
      await chBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_tarapoto_video.png') });

    // 4. Scroll to Official 68-Lot Masterplan (Manzanas A-H)
    await page.evaluate(() => {
      document.getElementById('plano-lotes')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    const mzBBtn = page.locator('button', { hasText: /Mz B/i });
    if (await mzBBtn.count()) {
      await mzBBtn.click();
      await page.waitForTimeout(350);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_masterplan_oficial.png') });

    // 5. Scroll to "Una vida sin filtros en el paraíso de Tarapoto" (Selva Profunda cards + Fauna/Flora)
    await page.evaluate(() => {
      document.getElementById('tarapoto-maravillas')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_tarapoto_maravillas.png') });

    // 6. Scroll to Contact & Footer
    await page.evaluate(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_contact_footer.png') });

    const pageCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const html = document.body.innerHTML;
      return {
        hasPhone: text.includes('+51 989 195 093'),
        hasWaLink: html.includes('https://wa.me/51989195093'),
        hasEmail: text.includes('aurora.aybar@gmail.com'),
        hasInstagram: html.includes('https://www.instagram.com/inmobiliaria.flamingo/'),
        hasFacebook: html.includes('https://www.facebook.com/profile.php?id=61583317215238'),
        hasHandle: text.includes('@ResidencialFlamingo'),
        hasCordillera: text.includes('Cordillera Escalera'),
        hasVideoSource: html.includes('/videos/tarapoto-flamingo-reel.mp4'),
      };
    });
    console.log('[Playwright] Verificación de contenido:', pageCheck);

    // 7. Quick Mobile Viewport Verification (390x844)
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mPage = await mobileCtx.newPage();
    mPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[Mobile] ${msg.text()}`);
    });
    mPage.on('pageerror', (err) => {
      pageErrors.push(`[Mobile] ${err.message}`);
    });
    await mPage.goto(LOCAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await mPage.waitForTimeout(600);
    const hasHorizontalOverflow = await mPage.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    console.log('[Playwright] Mobile horizontal overflow:', hasHorizontalOverflow);

    console.log(`[Playwright] Errores de consola: ${consoleErrors.length}`);
    console.log(`[Playwright] Excepciones de página: ${pageErrors.length}`);

    if (
      consoleErrors.length > 0 ||
      pageErrors.length > 0 ||
      hasHorizontalOverflow ||
      !pageCheck.hasPhone ||
      !pageCheck.hasWaLink ||
      !pageCheck.hasEmail ||
      !pageCheck.hasInstagram ||
      !pageCheck.hasFacebook ||
      !pageCheck.hasCordillera ||
      !pageCheck.hasVideoSource
    ) {
      console.error('Detalles de fallos:', {
        consoleErrors,
        pageErrors,
        hasHorizontalOverflow,
        pageCheck,
      });
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
