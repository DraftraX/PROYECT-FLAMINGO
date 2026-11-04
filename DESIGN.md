# Design System: Flamingo Residencial (Tarapoto, San Martín)

## 1. Visual Direction & Dials
- **Archetype**: Editorial Real Estate & Architectural Showroom (inspired by Selva Profunda & PeruBuilds).
- **Dials**:
  - `DESIGN_ENERGY`: `2` (Editorial restraint, high negative space, structured asymmetric splits, zero decorative clutter).
  - `RHYTHM`: `3` (Alternating light `#F5F1FA` editorial sections and deep `#23112B` immersive architectural/video showcases).
  - `MOTION`: `3` (150-frame canvas scroll sequence in the Hero, smooth before/after architectural wipe, and interactive 360° equirectangular panorama).

## 2. Color Palette & Contrast Ratios
- **Primary Ink / Deep Plum (`#23112B` & `#361D42`)**: Used for primary typography on light surfaces (`14.8:1` contrast against `#F5F1FA`, AAA) and as the dark canvas for the documentary video and masterplan lotizer.
- **Editorial Surface / Lavender Silk (`#F5F1FA` & `#EAE3F2`)**: Warm, low-glare editorial background derived from the official Flamingo Residencial brand book, preventing stark `#FFFFFF` harshness.
- **Secondary Editorial Ink (`#584763` & `#6B5876`)**: Used for body copy and technical labels on `#F5F1FA` (`5.9:1` contrast, AA+).
- **Primary Brand Accent (`#EE6B96` — Flamingo Coral)**: Reserved strictly for primary interactive triggers, active timeline markers, and the reconstructed Flamingo emblem (`8.4:1` contrast against `#23112B`).
- **Nature & Available Lot Accent (`#515B1B` & `#22C55E`)**: Olive green for editorial nature accents; high-visibility emerald for available lots on the interactive masterplan.

## 3. Typography & Hierarchy
- **Display & Headlines (`--font-display`)**: `'Geista Mond'`, Georgia serif fallback. Chosen to match the official Flamingo Residencial logotype and convey established legal and architectural permanence.
  - Hero H1: `clamp(2.35rem, 4.8vw, 4.35rem)`, `line-height: 1.04`, `letter-spacing: -0.01em`.
  - Section H2: `clamp(2.1rem, 4.1vw, 3.6rem)`, `line-height: 1.06`.
- **UI, Body & Technical Data (`--font-sans`)**: `'DM Sans'`, system sans-serif fallback. Chosen for geometric clarity in lot areas (`160 m²`, `200 m²`), prices, and coordinates (`tabular-nums`).
  - Body copy constrained to `60ch–70ch` max line width for comfortable reading.

## 4. Layout, Geometry & Justification (`R-31`)
- **Hero Frosted Portal (`CanvasScrollSequence.tsx`)**: Uses a single frosted architectural frame (`backdrop-blur-md`) over the 150-frame aerial drone sequence so the user reads the headline clearly before the portal opens into the full-viewport flight on scroll.
- **Top Navigation Bar**: Combines the reconstructed transparent Flamingo logo, a `48x48px` square menu drawer trigger, and direct section anchors so users can jump straight to the lotizer, video, or contact form at any scroll depth.
- **Documentary Video Player (`#tarapoto-video`)**: Pairs a `16:9` real video stage with a 5-chapter interactive index and an explicit voiceover toggle (`Escuchar con voz` / `Silenciar voz`) so buyers can either browse silently or listen to the Peruvian Spanish narration.
- **Obra Real vs. Proyección Comparator (`#proyecto`)**: Uses an interactive vertical split-wipe (`clip-path`) between real on-site photography and Google Flow video projections to prove physical construction progress without walls of text.
- **Interactive Masterplan (`#lotizador-360`)**: Renders all 68 official lots (`Manzanas A–H`) as clickable SVG polygons synchronized with a side specification sheet and WhatsApp reservation trigger.
- **Radius Scale**: `rounded-2xl` (`16px`) for secondary cards/inputs and `rounded-[24px]` (`24px`) for primary media stages.
- **Focus & Accessibility (`R-32`)**: Every interactive button, link, input, and select exposes a high-contrast `:focus-visible` outline (`2px solid #EE6B96` on dark surfaces, `2px solid #361D42` on light surfaces).
