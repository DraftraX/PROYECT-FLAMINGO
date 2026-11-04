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

    // 1. Capture Hero with anatomical Flamingo Wing Mask + 3 floating pink feathers
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_hero_wing_mask.png') });

    // 2. Scroll to Sección A: Showcase Cinemático con Narración de Audio
    await page.evaluate(() => {
      document.getElementById('entorno-tarapoto')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    const audioBtn = page.locator('[data-testid="toggle-audio-tour"]');
    await audioBtn.click();
    await page.waitForTimeout(400);
    const isVideoUnmuted = await page.evaluate(() => {
      const v = document.querySelector('#entorno-tarapoto video');
      return v ? v.muted === false : false;
    });
    console.log('[Playwright] Audio Tour activado (video.muted === false):', isVideoUnmuted);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_tarapoto_video.png') });

    // 3. Scroll to Sección B: Abanico Interactivo de Lotes (160m² & 200m²) + Widget Táctil de Obra
    await page.evaluate(() => {
      document.getElementById('abanico-lotes')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    const porticoPill = page.locator('button', { hasText: /Pórtico en Piedra y Madera/i });
    if (await porticoPill.count()) {
      await porticoPill.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_locket_lots_widget.png') });

    // 4. Test Slide-Over Contact Drawer opening from 200 m² Lot Card with automatic preselection
    const quote200Btn = page.locator('[data-testid="quote-200-btn"]');
    await quote200Btn.click();
    await page.waitForTimeout(550);
    const drawerState = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="contact-drawer"]');
      const isOpen = dialog ? dialog.getAttribute('data-open') === 'true' : false;
      const selected200 = dialog ? dialog.innerHTML.includes('Lote Amplio · 200 m²') : false;
      return { isOpen, selected200 };
    });
    console.log('[Playwright] Drawer abierto desde tarjeta 200 m²:', drawerState);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_contact_drawer.png') });

    // Close Drawer
    const closeDrawerBtn = page.locator('[role="dialog"] button[aria-label*="Cerrar"]');
    await closeDrawerBtn.click();
    await page.waitForTimeout(450);

    // 5. Scroll to Sección C: Explorador Inmersivo + Tarjeta Horizontal de Cierre (#2B1436)
    await page.evaluate(() => {
      document.getElementById('explorador-360')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_explorador_cierre.png') });

    // 6. Verify DOM Cleanliness (Deleted bloated sections must NOT exist)
    const domAudit = await page.evaluate(() => {
      const text = document.body.innerText;
      const html = document.body.innerHTML;
      return {
        hasWingMaskClipPath: Boolean(document.getElementById('flamingoWingMask')),
        removedGallitoRocas: !text.includes('Gallito de las Rocas'),
        removedMariposas: !text.includes('Mariposas de Cordillera Escalera'),
        removedVidaSinFiltros: !text.includes('Una vida sin filtros'),
        removedOldStaticForm: !text.includes('Separa tu lote hoy mismo'),
        removedOld4CardObra: !text.includes('Obra Real y Entorno Consolidado'),
        hasPhone: html.includes('+51 989 195 093'),
        hasEmail: html.includes('aurora.aybar@gmail.com'),
        hasInstagram: html.includes('https://www.instagram.com/inmobiliaria.flamingo/'),
        hasFacebook: html.includes('https://www.facebook.com/profile.php?id=61583317215238'),
        hasClosingCardHeadline: text.includes(
          'Tu terreno propio en Tarapoto, listo para construir hoy'
        ),
      };
    });
    console.log('[Playwright] Auditoría de limpieza DOM y elementos clave:', domAudit);

    // 7. Mobile Viewport Verification (390x844)
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

    // Open Drawer from Header "Contáctanos" button on Mobile
    const headerContactBtn = mPage.locator('[data-testid="header-contact-btn"]');
    await headerContactBtn.click();
    await mPage.waitForTimeout(450);
    const mobileDrawerOpen = await mPage.evaluate(() => {
      const dialog = document.querySelector('[data-testid="contact-drawer"]');
      return dialog ? dialog.getAttribute('data-open') === 'true' : false;
    });
    await mPage.locator('[role="dialog"] button[aria-label*="Cerrar"]').click();
    await mPage.waitForTimeout(350);

    const hasHorizontalOverflow = await mPage.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    console.log('[Playwright] Mobile Drawer OK:', mobileDrawerOpen);
    console.log('[Playwright] Mobile horizontal overflow:', hasHorizontalOverflow);

    console.log(`[Playwright] Errores de consola: ${consoleErrors.length}`);
    console.log(`[Playwright] Excepciones de página: ${pageErrors.length}`);

    const allChecksPassed =
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      !hasHorizontalOverflow &&
      isVideoUnmuted &&
      drawerState.isOpen &&
      drawerState.selected200 &&
      mobileDrawerOpen &&
      Object.values(domAudit).every(Boolean);

    if (!allChecksPassed) {
      console.error('Detalles de fallos:', {
        consoleErrors,
        pageErrors,
        hasHorizontalOverflow,
        isVideoUnmuted,
        drawerState,
        mobileDrawerOpen,
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
