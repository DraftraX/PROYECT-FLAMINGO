# Inmobiliaria Flamingo — Proyecto Residencial Flamingo (Showroom Virtual 360°)

Showroom Virtual Interactivo 100% Frontend construido con **Astro 5**, **React**, **Tailwind CSS** y **GSAP ScrollTrigger**, replicando e integrando la arquitectura multicapa de video, lotes vectoriales SVG, comparador Día/Noche, 4 modelos de residencia con Tour Virtual 360° y modo calibrador OpenCV.

## Características Principales
- **Portada Cinemática & Scrollytelling (`/`)**:
  - Video aéreo de bienvenida (`intro_video.mp4`), secuencia animada de diapositivas con **GSAP** y video de transición (`trans_intro_to_0.mp4`) hacia el Showroom.
  - Secciones animadas con **GSAP ScrollTrigger**, incluyendo comparador Día/Noche sincronizado con el scroll y catálogo interactivo de los 4 modelos de casa.
- **Showroom Virtual Interactivo (`/showroom`)**:
  - `?step=intro`: Descenso de dron (`intro.day.mp4`) con transición sin parpadeo (`0ms crossfade`) hacia el bucle estático (`loop.day.mp4`) y conmutador Día/Noche.
  - `?step=sides`: Giro aéreo 360° por las 4 caras de la urbanización con videos de transición reales.
  - `?step=phases` & `?step=zones`: Selección vectorial de Etapas y Zonas con vuelos de cámara de acercamiento.
  - `?step=lots`: Overlay SVG milimétrico de **133 lotes en 8 manzanas (Mz K a Mz R)** coloreados por disponibilidad (Verde, Ámbar, Rojo), conos de mirador con **Comparador Interactivo Día/Noche** y panel lateral de filtros en tiempo real.
  - `?step=models`: Explorador de los **4 Diseños de Casa de Residencial Flamingo** (*Modelo Coral*, *Modelo Brisa*, *Modelo Arena*, *Modelo Flamingo Imperial*) con 3 vistas exteriores, planos por nivel con videos de transición (*Amoblado*, *Medidas*, *Sin amoblar*), **Tour Virtual 360° Equirectangular con hotspots** y cotización directa a WhatsApp.
  - `?step=location` (`/ubicacion`): Mapa satelital 3D y vuelo planetario con 5 hitos en video.
  - `?calibrator=true`: Editor visual en vivo de polígonos y vértices SVG con soporte para el mapa de homografía de 40° y bordes Canny generados con OpenCV.

## Comandos
```bash
npm install
npm run dev      # Servidor de desarrollo local
npm run build    # Compilación estática lista para Vercel (dist/)
```
