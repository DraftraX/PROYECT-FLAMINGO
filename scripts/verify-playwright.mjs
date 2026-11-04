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

    // 1. Capture Restored Hero (PeruBuilds + Selva Profunda Frosted Portal + 150-Frame Sequence)
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_restored_hero.png') });

    // 2. Scroll to #nosotros (Reconstructed Logo + Manifesto)
    await page.evaluate(() => {
      document.getElementById('nosotros')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_nosotros_logo.png') });

    // 3. Scroll to #tarapoto-video (Real Documentary Video + Peruvian Neural Voiceover Toggle)
    await page.evaluate(() => {
      document.getElementById('tarapoto-video')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    const voiceBtn = page.locator('#tarapoto-video button', { hasText: /Escuchar con voz/i });
    await voiceBtn.click();
    await page.waitForTimeout(400);
    const isVideoUnmuted = await page.evaluate(() => {
      const v = document.querySelector('#tarapoto-video video');
      return v ? v.muted === false : false;
    });
    console.log('[Playwright] Voz narrada activada (video.muted === false):', isVideoUnmuted);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_tarapoto_video.png') });

    // 4. Scroll to #proyecto (Obra Real vs. Proyección Comparator)
    await page.evaluate(() => {
      document.getElementById('proyecto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_proyecto_comparador.png') });

    // 5. Scroll to #lotizador-360 (Official 68-Lot Masterplan + 360° Viewer)
    await page.evaluate(() => {
      document.getElementById('lotizador-360')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_masterplan_oficial.png') });

    // 6. Scroll to #tarapoto-maravillas ("Una vida sin filtros" + Biodiversity Gallery)
    await page.evaluate(() => {
      document.getElementById('tarapoto-maravillas')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_tarapoto_maravillas.png') });

    // 7. Scroll to #contacto & Footer
    await page.evaluate(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_contact_footer.png') });

    // 8. Audit Restored DOM & Antislop Compliance
    const domAudit = await page.evaluate(() => {
      const text = document.body.innerText;
      const html = document.body.innerHTML;
      return {
        hasHeroSection: Boolean(document.getElementById('preventa-scroll-stage')),
        hasNosotrosSection: Boolean(document.getElementById('nosotros')),
        hasTarapotoVideoSection: Boolean(document.getElementById('tarapoto-video')),
        hasProyectoSection: Boolean(document.getElementById('proyecto')),
        hasLotizadorSection: Boolean(document.getElementById('lotizador-360')),
        hasMaravillasSection: Boolean(document.getElementById('tarapoto-maravillas')),
        hasUbicacionSection: Boolean(document.getElementById('ubicacion')),
        hasContactoSection: Boolean(document.getElementById('contacto')),
        noEmDashInText: !text.includes('—'),
        noDecorativeArrowInButtons: !text.includes('→'),
        hasPhone: html.includes('+51 989 195 093'),
        hasEmail: html.includes('aurora.aybar@gmail.com'),
        hasInstagram: html.includes('https://www.instagram.com/inmobiliaria.flamingo/'),
        hasFacebook: html.includes('https://www.facebook.com/profile.php?id=61583317215238'),
      };
    });
    console.log('[Playwright] Auditoría DOM y Antislop:', domAudit);

    // 9. Mobile Viewport Verification (390x844)
    console.log('[Playwright] Iniciando verificación Mobile (390x844)...');
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

    const allChecksPassed =
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      !hasHorizontalOverflow &&
      isVideoUnmuted &&
      Object.values(domAudit).every(Boolean);

    if (!allChecksPassed) {
      console.error('Detalles de fallos:', {
        consoleErrors,
        pageErrors,
        hasHorizontalOverflow,
        isVideoUnmuted,
        domAudit,
      });
      process.exitCode = 1;
    } else {
      console.log('[Playwright] ¡VERIFICACIÓN COMPLETA EXITOSA CON CERO ERRORES!');
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
