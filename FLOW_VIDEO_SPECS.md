# Google Flow (Veo) — Especificaciones de Video & Pipeline de Extracción (`CanvasScrollSequence`)

Este documento detalla la configuración exacta, fotogramas clave (*First Frame* / *Last Frame*) y prompts en inglés para generar el video de construcción progresiva por scroll de **Flamingo Residencial** en **Google Flow (Veo)**, así como el flujo de extracción automática de los `150` fotogramas `.webp` (`1920x1080`).

---

## 1. Fotogramas Clave Listos para Subir (`Frames to Video`)

Para conseguir el efecto hipnótico de **construcción controlada por scroll** (estilo *PeruBuilds*), la cámara aérea de dron debe permanecer **100% bloqueada en el mismo encuadre** (*locked-off steady aerial shot*). Ya hemos generado y limpiado a partir del flyer oficial los fotogramas clave en `16:9` dentro de `public/flow-frames/`:

| Rol en Google Flow | Archivo Local Listo | Descripción Visual |
| :--- | :--- | :--- |
| **First Frame (Imagen Inicial)** | `public/flow-frames/first-frame.jpg` | Misma toma aérea del terreno verde de **Flamingo Residencial** y el paisaje del valle al fondo **sin líneas punteadas, textos ni superposiciones gráficas**, mostrando el campo limpio con neblina matutina suave y el **Colegio Virgen Dolorosa** a 30 metros en primer plano. |
| **Last Frame (Imagen Final)** | `public/flow-frames/last-frame.jpg` | Exactamente el mismo ángulo aéreo bloqueado, pero con la urbanización **Flamingo Residencial** ya trazada y consolidada: vías internas afirmadas y pavimentadas, lotes de **160 m² y 200 m²** delimitados con sardineles y jardines, pórtico de ingreso moderno, palmeras en alamedas, postes de alumbrado público encendidos con luz cálida de atardecer (*Golden Hour*) y el entorno del Colegio Virgen Dolorosa integrado a 30 metros. |

### Fotogramas Intermedios Adicionales (Incluidos en `public/flow-frames/`)
- `public/flow-frames/stage-00.jpg` — Terreno 100% virgen cubierto de pradera verde matutina.
- `public/flow-frames/stage-25.jpg` — Apertura de trochas iniciales y pórtico base.
- `public/flow-frames/stage-50.jpg` — Habilitación urbana al mediodía: afirmado de vías, vaciado de sardineles blancos y redes de agua, desagüe y postes.
- `public/flow-frames/stage-75.jpg` — Lotización consolidada en luz diurna de tarde (lotes verdes de 160 m² y 200 m² listos para entrega inmediata).
- `public/flow-frames/stage-100.jpg` — Atardecer dorado (*Golden Hour*) con alumbrado público LED encendido.

---

## 2. Parámetros y Motion Prompt para Google Flow (Veo)

- **Modo en Google Flow**: `Frames to Video` (`First Frame` → `Last Frame`)
- **Relación de Aspecto**: `16:9` (Horizontal)
- **Resolución de Salida**: `1080p` (`1920x1080`) o `4K` (`3840x2160`)
- **Duración**: `8 segundos` (sin cortes de escena)
- **Movimiento de Cámara**: `Static / Locked-off Drone Tripod`

### Motion Prompt Principal (Inglés)
```text
Locked-off steady aerial drone timelapse photography over a lush green tropical valley lotization. Smooth continuous architectural progression from empty green land into a finished modern residential land development: internal roads smoothly carve and pave into place, neat rectangular lot boundaries form cleanly across the grass, a modern minimalist entrance gate rises at the main road, tropical palm trees grow along avenues, and warm street lights turn on as golden hour sunlight bathes the landscape. Zero camera cuts, ultra-smooth progressive motion, photorealistic architectural visualization, 4k.
```

### Negative Prompt (Opcional / Recomendado)
```text
camera cuts, scene transitions, camera pan, zoom out, drone flying away, floating text, watermarks, UI overlays, sudden jumps, clouds blocking view, distorted buildings.
```

---

## 3. Integración en un Solo Comando (`npm run extract:frames`)

1. Cuando descargues el archivo `.mp4` desde Google Flow, guárdalo en:
   ```text
   raw-video/flamingo-flow.mp4
   ```
2. Ejecuta el comando de extracción en la raíz del proyecto:
   ```bash
   npm run extract:frames
   ```
   *(En entornos Unix/Git Bash también puedes ejecutar directamente `bash scripts/process-flow-video.sh`).*
3. El pipeline utiliza `ffmpeg` con escalado **Lanczos** (`1920x1080`, calidad `82`) para generar exactamente `150` fotogramas:
   ```text
   public/sequence/frame_0001.webp ... public/sequence/frame_0150.webp
   ```
4. El componente `<CanvasScrollSequence />` detecta automáticamente la secuencia en `public/sequence/` y activa el scrubbing cuadro a cuadro a `60fps` controlado por el scroll (`Lenis` + `GSAP ScrollTrigger`) y el parallax de mouse (`gsap.quickTo`).
