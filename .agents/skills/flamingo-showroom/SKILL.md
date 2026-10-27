---
name: flamingo-showroom
description: Estándar arquitectónico y visual para construir y mantener el Showroom Virtual Interactivo de Inmobiliaria Flamingo (basado en la ingeniería inversa de El Olimpo de Tumbes).
---

# Skill: Flamingo Showroom Virtual Architecture

Usa esta skill siempre que modifiques o amplíes el Showroom Virtual Interactivo de **Inmobiliaria Flamingo - Proyecto Residencial Flamingo**.

## Reglas de Oro de Arquitectura
1. **Visor Inmersivo `100vw x 100dvh`**:
   - En `/showroom`, jamás uses layouts de página convencionales con scroll vertical suelto. Todo ocurre dentro de un contenedor `.h-app` (`100dvh`, `overflow-hidden`) con capas apiladas (`z-0` imagen de respaldo, `z-10` video loop/intro y SVG interactivo, `z-20` controles flotantes y conos de cámara, `z-30` videos de transición y sidebar, `z-40` modales de lote/casas/comparador día-noche, `z-50` tour 360° y menú inferior).
2. **Alineación Sub-píxel de Polígonos SVG (`ShowroomStage`)**:
   - Tanto la imagen/video de fondo como el `<svg>` de lotes deben vivir dentro del mismo contenedor con relación de aspecto bloqueada (`width: max(100cqw, calc(100cqh * 1.7777778))`, `height: max(100cqh, calc(100cqw / 1.7777778))`).
3. **Transiciones de Video sin Parpadeo (`0ms Crossfade`)**:
   - Mantén siempre la imagen `.webp` del fotograma final debajo del `<video>`.
   - Cuando `intro.day.mp4` emite `onEnded`, cambia el estado `introDone = true` y activa `loop.day.mp4` sobre el mismo encuadre sin desmontar el fondo.
4. **Estética y Componentes Visuales**:
   - Usa la paleta oficial costera de lujo:
     - `--color-brand-orange`: `#d69135` (Dorado Coral / Terracota)
     - `--color-brand-primary`: `#233d78` (Azul Océano Profundo)
     - `--color-flamingo-accent`: `#f43f5e` (Acento Coral Flamingo)
   - Conserva los detalles arquitectónicos del dock de navegación inferior (`.olympus-fret`, `.olympus-cornice`, `.olympus-colonnade`, `.olympus-btn`).
5. **Compatibilidad 100% Frontend (Astro Static en Vercel)**:
   - Toda la persistencia de calibración de lotes (`?calibrator=true`) y formularios de prospectos debe funcionar 100% en el cliente (con `localStorage`, descarga directa de `lots.json` y redirección/cotización inmediata a WhatsApp) para que el despliegue estático en Vercel no dependa de servidores externos.
