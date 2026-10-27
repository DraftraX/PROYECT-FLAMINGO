# DESIGN.md — Inmobiliaria Flamingo · Proyecto Residencial Flamingo

## Aesthetic Direction & Domain Exemplars
- **Primary Category:** `brand_marketing_info` / `interactive_3d_ architectural_showroom`
- **Subcategory:** Real Estate Virtual Masterplan & Interactive Aerial Showroom
- **Theme Polarity:** Intentional Dark Mode (`#0a0e1a` Obsidian Ocean canvas) inside the showroom viewer so aerial drone renders, emerald/amber/rose SVG lot overlays, and Day/Night lighting transitions pop with maximum contrast; paired with Warm Ivory (`#f8fafc`) architectural specification drawers for floorplan inspection.
- **Exemplars:** *El Olimpo de Tumbes Interactive Showroom* (OI Soluciones Inmobiliarias) & luxury coastal masterplan configurators (Sotheby's International Realty / BIG Bjarke Ingels Group interactive masterplans).

## Color Palette & Atmospheric Tokens
- **Canvas Background:** `#0a0a0a` / `#0c1428` (`--color-ocean-950`)
- **Elevated Glass Surface:** `rgba(12, 20, 40, 0.82)` with `backdrop-filter: blur(20px)` and `1px solid rgba(255, 255, 255, 0.14)`
- **Primary Brand Accent:** `#233d78` (`--color-brand-primary`, Deep Coastal Navy)
- **Warm Gold / Flamingo Sunset Accent:** `#d69135` (`--color-brand-orange`) and `#e5ab5e` (`--color-brand-light-orange`)
- **Semantic Lot Statuses:**
  - `Available` (Disponible): `#00d294` (`emerald-400`, fill opacity `0.38`, stroke `#ffffff`)
  - `Reserved` (Reservado): `#fcbb00` (`amber-400`, fill opacity `0.42`, stroke `#fde68a`)
  - `Sold` (Vendido): `#ff667f` (`rose-400`, fill opacity `0.40`, stroke `#fda4af`)

## Typography & Scannable Hierarchy
- **Display / Headings (`--font-primary`):** `'Montserrat'`, geometric uppercase tracking (`0.14em`–`0.24em`), weights `600`–`800`.
- **UI & Body (`--font-secondary`):** `'Inter'`, clean legible sans-serif for lot tables, filter pills, and technical specifications.
- **Numeric Discipline:** `font-variant-numeric: tabular-nums` on all lot areas (`m²`), prices (`USD` / `S/`), and coordinates.

## Layout, Spatial Architecture & Motion
- **Full-Viewport Stage (`100vw x 100dvh`):** Zero page scroll inside `/showroom`; all navigation is spatial (aerial camera transitions, SVG polygon selection, collapsible bottom architectural dock, and right-hand glass filter drawer).
- **Scroll-Driven Narrative (`/`):** The landing experience features the exact fullscreen video intro + GSAP text sequence from the reference site, plus an interactive scroll-animated showcase below with GSAP ScrollTrigger scrub animations, masterplan breakdown, and direct transition into `/showroom?step=intro`.
