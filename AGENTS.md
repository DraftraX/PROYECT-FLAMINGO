# Arquitectura Técnica e Ingeniería Inversa: Showroom Virtual Interactivo
**Proyecto:** Inmobiliaria Flamingo — Proyecto Residencial Flamingo
**Referencia Base:** `https://elolimpodetumbes.oisolucionesinmobiliarias.com/showroom?step=intro`
**Stack:** Astro 5 + React 19 (Client Islands) + Tailwind CSS + GSAP 3.14 (ScrollTrigger & Timelines) + Mapbox GL / Visor Satelital 3D + Visor Equirectangular 360°

---

## 1. Estructura DOM y Contenedor Inmersivo (`100vw x 100dvh`)
- **Viewport Lock en Showroom:** El visor principal utiliza `:root { --app-h: 100dvh }` y `.h-app { height: var(--app-h) }` con `overflow: hidden` para garantizar una experiencia tipo aplicación nativa sin barras de scroll accidentales dentro del visor interactivo, mientras que la portada (`/`) combina una secuencia cinemática de entrada con narrativa scrollytelling impulsada por GSAP ScrollTrigger.
- **Stage Container (`ShowroomStage`):**
  - Contenedor externo: `position: absolute; inset: 0; overflow: hidden; container-type: size;`
  - Contenedor interno (`[data-showroom-stage]`): centrado al `50% / 50%` con `-translate-x-1/2 -translate-y-1/2` y dimensiones calculadas dinámicamente según la relación de aspecto (`ratio = 16 / 9` o `naturalWidth / naturalHeight`):
    ```css
    width: max(100cqw, calc(100cqh * 1.7777778));
    height: max(100cqh, calc(100cqw / 1.7777778));
    ```
  - Esto asegura que la imagen base (`<img class="object-cover">`), el video en reproducción y el `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` o `<svg viewBox="0 0 1920 1080">` calcen con precisión sub-píxel en cualquier resolución de pantalla.

---

## 2. Máquina de Estados y Rutas por Query Params (`/showroom`)
El Showroom opera mediante una máquina de estados sincronizada con la URL (`?step=...`):
1. **`?step=intro` (`CARA 0`):**
   - Imagen póster base: `urbanization/sides/side-0/day.webp` (y su par `night.webp`).
   - Video de entrada: `urbanization/sides/side-0/intro.day.mp4` (`autoPlay`, `muted`, `playsInline`, `preload="auto"`).
   - Al dispararse `onEnded`, conmuta con transición de opacidad cruzada sin parpadeo hacia `urbanization/sides/side-0/loop.day.mp4` (`loop=true`).
   - Al pulsar **"INGRESAR"**, reproduce el video puente `urbanization/sides/transitions/side-0_to_side-1.day.mp4` (`z-30`) y al finalizar pasa a `?step=sides`.
2. **`?step=sides` (`VISTAS 360° DEL PROYECTO`):**
   - Permite orbitar alrededor de las 4 caras aéreas (`side-1`, `side-2`, `side-3`, `side-4`) usando botones laterales o teclas `ArrowLeft` / `ArrowRight`.
   - Cada giro reproduce el video de transición correspondiente (`side-1_to_side-2.day.mp4`, etc.).
   - Al pulsar **"Ingresar al proyecto"**, reproduce `side-{N}_to_master-plan.day.mp4` y avanza a `?step=phases`.
3. **`?step=phases` (`MASTERPLAN DE ETAPAS`):**
   - Muestra `urbanization/master-plan.webp` con polígonos SVG para `phase-1` a `phase-4`.
   - Al seleccionar una fase disponible, reproduce `urbanization/phases/phase-1/entry.mp4` y pasa a `?step=zones`.
4. **`?step=zones` (`ZONAS DE LA ETAPA`):**
   - Muestra `urbanization/phases/phase-1/overview.webp` con recortes vectoriales para `zone-1`, `zone-2`, `zone-3`.
   - Al elegir una zona, reproduce `urbanization/phases/phase-1/zone-{1..3}-entry.mp4` y abre `?step=lots` (`ZONE_VIEW`).
5. **`?step=lots` (`ZONE_VIEW — LOTES, MIRADORES DÍA/NOCHE Y FILTROS`):**
   - Renderiza `urbanization/phases/phase-1/zone-{1..3}.webp` + los lotes extraídos por OpenCV del plano de Residencial Flamingo (`1920x1080`).
   - Superpone:
     - **Manzanas (`mz-k` a `mz-r` + Manzanas Flamingo `mz-a` a `mz-f`)** y **Polígonos de Lotes** coloreados según disponibilidad (`available` Esmeralda, `reserved` Ámbar, `sold` Rosa/Rojo).
     - **Conos de Mirador (`ViewpointCone`)**: Botones SVG con abanico direccional que abren el **Comparador Interactivo Día / Noche** (`clip-path: inset(0 ${100 - split}% 0 0)`).
     - **Sidebar Derecho**: Pestañas **Vistas** y **Filtros** (por Manzana, Área en m², Posición Esquina/Intermedio y Disponibilidad).
6. **`?step=models` / Selección de Lote (`HouseModal` + `LotDetailView`):**
   - Al hacer clic en cualquier lote, abre la vista de detalle del terreno con su plano acotado (`-medidas.webp`) y permite superponer o explorar los **4 Modelos de Casa de Residencial Flamingo**:
     1. **Modelo Coral (`casa-1`)** — 2 pisos · 85 m² construidos · 3 Dormitorios
     2. **Modelo Brisa (`casa-2`)** — 2 pisos · 110 m² construidos · 3 Dormitorios + Rooftop
     3. **Modelo Arena (`casa-3`)** — 1 piso · 68 m² construidos · 2 Dormitorios
     4. **Modelo Flamingo Imperial (`casa-4`)** — 2 pisos + Terraza · 145 m² construidos · 4 Dormitorios + Piscina
   - Incluye conmutador de **3 ángulos exteriores** (Frontal, Diagonal 3/4, Posterior), **planos interactivos por nivel** (Amoblado, Medidas, Sin amoblar con videos de transición entre vistas), **Tour Virtual 360° Equirectangular interactivo** (Sala-Comedor, Cocina, Dormitorio Principal con hotspots 3D + integración Kuula 360°) y **Cotización directa por WhatsApp** + Formulario de Prospectos.
7. **`?step=location` (`/ubicacion`):**
   - Globo satelital interactivo + Mapbox GL / Mapa 3D con el polígono de Residencial Flamingo, rutas de acceso y videos de hitos cercanos (Aeropuerto, Playas de Zorritos, Costa Mar Plaza, Plaza de Armas, Manglares).
8. **`?calibrator=true` (`CalibratorOverlay`):**
   - Editor visual en vivo sobre el masterplan que permite arrastrar vértices de cualquier lote, crear nuevos polígonos con clic, modificar estado/precio/metraje, guardar en `localStorage` y exportar/descargar el archivo `./src/data/lots.json` listo para producción.

---

## 3. Pipeline de Computer Vision y Activos IA
- **`./scripts/process_masterplan.py`**: Toma `./assets-input/plano-flamingo.png`, aplica homografía de perspectiva aérea de dron a 40°, genera `./public/urbanization/sides/side-0/blueprint-perspective.png` y `canny-edges.png` en `1920x1080`, detecta contornos cerrados con `cv2.findContours` + `cv2.approxPolyDP` y exporta `./src/data/lots.json`.
- **`./scripts/generate_ai_assets.py`**: Pipeline reproducible con soporte para Replicate / Fal API y generador local de respaldo de alta resolución para `day.webp`, `night.webp`, las 3 vistas exteriores de cada una de las 4 casas (`casa-1..4`) y las 3 panorámicas equirectangulares 360° (`2:1`) por modelo.
