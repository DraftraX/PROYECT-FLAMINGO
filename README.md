# Flamingo Residencial — Experiencia Inmersiva Scrollytelling + Canvas Frame-Scrubbing 2.5D

Landing page interactiva de alto impacto e infraestructura de Showroom Virtual 360° para **Flamingo Residencial**, construida con **Astro 5 + React + TypeScript + Tailwind CSS + GSAP ScrollTrigger + Lenis**.

---

## 1. Identidad de Marca, Tipografía y Paleta Editorial

### Sistema Tipográfico Estricto (`docs/brand/tipografia-marca.png`)
- **Títulos y palabras a resaltar (`Geista Mond Regular`)**:
  - Declarado mediante `@font-face` en `src/styles/global.css` apuntando a `/public/fonts/GeistaMond-Regular.woff2` (peso `400`, estilo editorial serif de alto contraste).
  - Si deseas reemplazar el binario `.woff2` provisto por una licencia comercial actualizada de `GeistaMond-Regular.woff2`, simplemente sobrescribe `/public/fonts/GeistaMond-Regular.woff2` (se mantiene `'Cormorant Garamond'` únicamente como fallback de seguridad).
- **Subtítulos, etiquetas, botones y cuerpo de texto (`DM Sans`)**:
  - Cargado desde Google Fonts en pesos `400`, `500` y `700`.

### Paleta Cromática Oficial (`docs/brand/flyer-preventa.jpg`)
- **Fondo Lavanda Seda**: `#EAE3F2` y `#F5F1FA`
- **Ciruela Profundo**: `#361D42` y `#23112B`
- **Rosa Flamenco**: `#EE6B96` / `#F48FB1`
- **Verde Oliva Orgánico**: `#515B1B`

### Procesamiento del Logotipo (`npm run brand:logo`)
- Ejecuta `node scripts/process-brand-logo.mjs` (con `sharp`) para eliminar limpiamente el fondo lavanda sólido (`#E5DEF0`) de `public/brand/logo-flamingo-raw.png` y generar:
  - `public/brand/logo-flamingo.png` (para fondos claros lavanda seda)
  - `public/brand/logo-flamingo-light.png` (para fondos oscuros ciruela/oliva)

---

## 2. Motor `<CanvasScrollSequence />` y Pipeline Google Flow (Veo)

1. **Secuencia de 150 Frames (`.webp` `1920x1080`)**:
   - Ubicada en `public/sequence/frame_0001.webp` ... `public/sequence/frame_0150.webp`.
   - Sección fijada (`pin: true`, recorrido `450vh`, `scrub: 0.6`) sincronizada con `Lenis` + `GSAP ScrollTrigger` y parallax multicapa 2.5D al mover el cursor (`gsap.quickTo`).
2. **Fotogramas Base y Prompts para Google Flow (`FLOW_VIDEO_SPECS.md`)**:
   - `public/flow-frames/first-frame.jpg`: Toma aérea limpia del terreno virgen sin textos ni líneas punteadas, conservando el entorno y el Colegio Virgen Dolorosa a 30 metros.
   - `public/flow-frames/last-frame.jpg`: Mismo ángulo aéreo bloqueado con la lotización **Flamingo Residencial** consolidada (vías afirmadas, sardineles, lotes de 160 m² y 200 m², pórtico de ingreso, palmeras y alumbrado público encendido al atardecer).
3. **Extracción Automática con FFmpeg (`npm run extract:frames`)**:
   - Coloca el video descargado de Google Flow en `raw-video/flamingo-flow.mp4` y ejecuta:
     ```bash
     npm run extract:frames
     # o en Bash/Linux/macOS:
     bash scripts/process-flow-video.sh
     ```

---

## 3. Comandos de Desarrollo y Producción

```bash
# Instalar dependencias
npm install

# Procesar logotipo oficial sin fondo
npm run brand:logo

# Generar / extraer los 150 frames .webp (1920x1080, calidad 82, Lanczos)
npm run extract:frames

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
