import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildFlamingoWhatsAppUrl, FLAMINGO_BRAND } from '../config/flamingo';

gsap.registerPlugin(ScrollTrigger);

interface CanvasScrollSequenceProps {
  onNavigate?: (sectionId: string) => void;
}

const TOTAL_FRAMES = 150;
const getFrameUrl = (index: number): string =>
  `/sequence/frame_${String(Math.min(TOTAL_FRAMES, Math.max(1, index))).padStart(4, '0')}.webp`;

export const CanvasScrollSequence: React.FC<CanvasScrollSequenceProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinStageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const portalOverlayRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const midCaptionRef = useRef<HTMLDivElement | null>(null);
  const outroCurtainRef = useRef<HTMLDivElement | null>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(1);
  const rafDrawRef = useRef<number | null>(null);
  const phaseIdxRef = useRef<number>(0);

  const [activePhaseIdx, setActivePhaseIdx] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const PHASES = [
    {
      num: '01',
      label: 'REPLANTEO Y LOTIZACIÓN EN TARAPOTO',
      detail: 'Lotes independizados de 160 m² (8m × 20m) y 200 m² (10m × 20m)',
    },
    {
      num: '02',
      label: 'HABILITACIÓN URBANA INTEGRAL',
      detail: 'Redes ejecutadas de agua potable, desagüe y alumbrado público',
    },
    {
      num: '03',
      label: 'ENTORNO NATURAL Y EDUCATIVO',
      detail: 'A 30 metros del Colegio Virgen Dolorosa con vista a la Cordillera Escalera',
    },
    {
      num: '04',
      label: 'ENTREGA INMEDIATA CON TÍTULO',
      detail: 'Pórtico monumental construido y propiedad lista para tu hogar',
    },
  ];

  const drawFrameToCanvas = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = frameIndex - 1 - offset;
        const next = frameIndex - 1 + offset;
        if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]!.naturalWidth > 0) {
          img = imagesRef.current[prev];
          break;
        }
        if (
          next < TOTAL_FRAMES &&
          imagesRef.current[next]?.complete &&
          imagesRef.current[next]!.naturalWidth > 0
        ) {
          img = imagesRef.current[next];
          break;
        }
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;

    const targetW = Math.round(cw * dpr);
    const targetH = Math.round(ch * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(targetW / iw, targetH / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const dx = (targetW - drawW) * 0.5;
    const dy = (targetH - drawH) * 0.5;

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, drawW, drawH);
  };

  useEffect(() => {
    let isCancelled = false;
    const priorityIndices = [1, 18, 36, 54, 75, 96, 115, 132, 150];
    const loadedSet = new Set<number>();

    const loadSingleFrame = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        if (loadedSet.has(idx) || isCancelled) {
          resolve();
          return;
        }
        loadedSet.add(idx);
        const img = new Image();
        img.decoding = 'async';
        img.src = getFrameUrl(idx);
        img.onload = () => {
          if (isCancelled) {
            resolve();
            return;
          }
          imagesRef.current[idx - 1] = img;
          if (idx === 1 || idx === currentFrameRef.current) {
            drawFrameToCanvas(currentFrameRef.current);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });

    (async () => {
      await loadSingleFrame(1);
      await Promise.all(priorityIndices.map((idx) => loadSingleFrame(idx)));
      const remaining: number[] = [];
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (!loadedSet.has(i)) remaining.push(i);
      }
      const concurrency = 10;
      for (let i = 0; i < remaining.length; i += concurrency) {
        if (isCancelled) break;
        await Promise.all(remaining.slice(i, i + concurrency).map((idx) => loadSingleFrame(idx)));
      }
    })();

    const handleResize = () => drawFrameToCanvas(currentFrameRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const pinStage = pinStageRef.current;
    if (!section || !pinStage) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=320%',
        pin: pinStage,
        scrub: 0.45,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;

          const frameProgress = Math.min(1, p / 0.84);
          const targetFrame = Math.min(
            TOTAL_FRAMES,
            Math.max(1, Math.round(1 + frameProgress * (TOTAL_FRAMES - 1)))
          );

          if (targetFrame !== currentFrameRef.current) {
            currentFrameRef.current = targetFrame;
            if (rafDrawRef.current) cancelAnimationFrame(rafDrawRef.current);
            rafDrawRef.current = requestAnimationFrame(() => {
              drawFrameToCanvas(targetFrame);
            });
          }

          if (portalOverlayRef.current) {
            const portalT = Math.min(1, Math.max(0, p / 0.28));
            const scaleVal = 1 + Math.pow(portalT, 2.1) * 11;
            const opacityVal = Math.max(0, 1 - Math.pow(portalT, 1.5) * 1.15);
            portalOverlayRef.current.style.transform = `scale(${scaleVal.toFixed(3)})`;
            portalOverlayRef.current.style.opacity = String(opacityVal.toFixed(3));
            portalOverlayRef.current.style.visibility = opacityVal <= 0.01 ? 'hidden' : 'visible';
          }

          if (heroCopyRef.current) {
            const copyT = Math.min(1, Math.max(0, p / 0.2));
            heroCopyRef.current.style.opacity = String((1 - copyT).toFixed(3));
            heroCopyRef.current.style.transform = `translate3d(0, ${(-copyT * 48).toFixed(1)}px, 0)`;
            heroCopyRef.current.style.visibility = copyT >= 0.99 ? 'hidden' : 'visible';
          }

          if (midCaptionRef.current) {
            const showMid = p >= 0.2 && p <= 0.82;
            const midOpacity = showMid
              ? p < 0.26
                ? (p - 0.2) / 0.06
                : p > 0.76
                  ? (0.82 - p) / 0.06
                  : 1
              : 0;
            midCaptionRef.current.style.opacity = String(Math.max(0, Math.min(1, midOpacity)).toFixed(3));
          }

          const nextPhaseIdx = p < 0.36 ? 0 : p < 0.54 ? 1 : p < 0.7 ? 2 : 3;
          if (nextPhaseIdx !== phaseIdxRef.current) {
            phaseIdxRef.current = nextPhaseIdx;
            setActivePhaseIdx(nextPhaseIdx);
          }

          if (outroCurtainRef.current) {
            const outroT = Math.min(1, Math.max(0, (p - 0.8) / 0.16));
            outroCurtainRef.current.style.opacity = String(outroT.toFixed(3));
            outroCurtainRef.current.style.pointerEvents = outroT > 0.5 ? 'auto' : 'none';
          }
        },
      });
    }, section);

    return () => {
      if (rafDrawRef.current) cancelAnimationFrame(rafDrawRef.current);
      ctx.revert();
    };
  }, []);

  const navItems = [
    { label: 'Nosotros', id: 'nosotros' },
    { label: 'Video Documental', id: 'tarapoto-video' },
    { label: 'El Proyecto', id: 'proyecto' },
    { label: 'Masterplan 360°', id: 'lotizador-360' },
    { label: 'Tarapoto y Biodiversidad', id: 'tarapoto-maravillas' },
    { label: 'Ubicación', id: 'ubicacion' },
    { label: 'Contacto', id: 'contacto' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activePhase = PHASES[activePhaseIdx] || PHASES[0];

  return (
    <div className="relative w-full bg-[#23112B] select-none">
      {/* =====================================================================
          STICKY MINIMALIST HEADER (SELVA PROFUNDA + FLAMINGO RESIDENCIAL)
          Kept outside <section ref={sectionRef}> so GSAP pin-spacer never
          conflicts with React sibling DOM nodes.
         ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center">
          {/* Reconstructed HD Logo Block */}
          <a
            href="#top"
            className="pointer-events-auto flex items-center gap-3 bg-[#23112B]/90 backdrop-blur-md px-6 py-3 h-20 border-b border-r border-white/10 transition-colors hover:bg-[#361D42] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#EE6B96]"
          >
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-14 w-auto object-contain"
            />
          </a>

          {/* Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center gap-1.5 bg-[#190B20]/95 text-white border-b border-white/10 transition-colors hover:bg-[#EE6B96] hover:text-[#23112B] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#EE6B96]"
          >
            <span
              className={`h-0.5 w-6 bg-current transition-transform duration-200 ${
                mobileMenuOpen ? 'translate-y-1 rotate-45' : ''
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-transform duration-200 ${
                mobileMenuOpen ? '-translate-y-1 -rotate-45' : ''
              }`}
            />
          </button>

          {/* Horizontal Editorial Links */}
          <nav
            style={{
              opacity: activePhaseIdx === 0 && !mobileMenuOpen ? 1 : 0,
              pointerEvents: activePhaseIdx === 0 && !mobileMenuOpen ? 'auto' : 'none',
            }}
            className="hidden xl:flex items-center gap-7 pl-8 transition-opacity duration-300"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="font-dm text-sm font-medium tracking-wide text-white/95 hover:text-[#F48FB1] transition-colors cursor-pointer drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EE6B96]"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Top-Right Direct WhatsApp Link */}
        <div
          style={{
            opacity: activePhaseIdx === 0 && !mobileMenuOpen ? 1 : 0,
            pointerEvents: activePhaseIdx === 0 && !mobileMenuOpen ? 'auto' : 'none',
          }}
          className="flex items-center gap-3 pr-4 sm:pr-8 transition-opacity duration-300"
        >
          <a
            href={buildFlamingoWhatsAppUrl(0)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2.5 rounded-full bg-[#361D42]/90 backdrop-blur-md border border-[#F48FB1]/40 px-5 py-2.5 font-dm text-xs font-bold uppercase tracking-[0.16em] text-[#F5F1FA] hover:bg-[#EE6B96] hover:text-[#23112B] hover:border-[#EE6B96] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
          >
            <span>{FLAMINGO_BRAND.contact.phoneDisplay}</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => handleNavClick('contacto')}
          className="pointer-events-auto fixed right-0 top-24 z-50 flex h-44 w-12 items-center justify-center rounded-l-xl bg-[#EE6B96] text-[#23112B] font-dm text-[11px] font-bold uppercase tracking-[0.22em] transition-colors hover:bg-[#F48FB1] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="-rotate-90 whitespace-nowrap">Hablemos</span>
        </button>
      </header>

      {/* Persistent Mobile / Full Navigation Drawer */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-40 bg-[#23112B]/98 backdrop-blur-xl flex flex-col justify-center px-8 sm:px-20 transition-all duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-5xl space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-16 w-auto object-contain"
            />
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-[#F48FB1]">
              Tarapoto · San Martín · Preventa Oficial
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => handleNavClick(item.id)}
                className="font-geista text-3xl sm:text-5xl text-white hover:text-[#F48FB1] transition-colors text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EE6B96]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-8 border-t border-white/15 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#EAE3F2]/85 font-dm">
            <a
              href={buildFlamingoWhatsAppUrl(0)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F48FB1] transition-colors font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
            >
              {FLAMINGO_BRAND.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${FLAMINGO_BRAND.contact.email}`}
              className="hover:text-[#F48FB1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
            >
              {FLAMINGO_BRAND.contact.email}
            </a>
            <a
              href={FLAMINGO_BRAND.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F48FB1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
            >
              Instagram ({FLAMINGO_BRAND.contact.handle})
            </a>
            <a
              href={FLAMINGO_BRAND.contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F48FB1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
            >
              Facebook Oficial
            </a>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PINNED 100VH STAGE — Dedicated <section> with single child pinStageRef
         ===================================================================== */}
      <section
        id="preventa-scroll-stage"
        ref={sectionRef}
        className="relative w-full bg-[#23112B]"
      >
        <div ref={pinStageRef} className="relative w-full h-screen overflow-hidden bg-[#23112B]">
          {/* Full-bleed Canvas Sequence (150 frames .webp) */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Subtle Dark Vignette for Typographic Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#23112B]/75 via-[#23112B]/35 to-transparent pointer-events-none" />

          {/* Frosted Architectural Portal */}
          <div
            ref={portalOverlayRef}
            className="absolute inset-0 z-10 pointer-events-none origin-center will-change-transform"
          >
            <div
              className="absolute inset-0 bg-[#361D42]/45 backdrop-blur-[5px]"
              style={{
                clipPath: 'polygon(0% 0%, 16% 0%, 56% 68%, 34% 100%, 0% 100%)',
              }}
            />
            <div
              className="absolute inset-0 bg-[#EAE3F2]/15 backdrop-blur-[4px]"
              style={{
                clipPath: 'polygon(52% 0%, 96% 0%, 75% 38%)',
              }}
            />
          </div>

          {/* Hero Copy: Selva Profunda & PeruBuilds Architectural Elegance */}
          <div
            ref={heroCopyRef}
            className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-14 lg:px-20 flex flex-col justify-center pointer-events-none will-change-transform"
          >
            <div className="max-w-3xl space-y-6 pt-14">
              <div className="flex items-center gap-4">
                <svg
                  width="54"
                  height="38"
                  viewBox="0 0 64 44"
                  fill="none"
                  className="shrink-0 text-[#EE6B96]"
                  aria-hidden="true"
                >
                  <path d="M2 22L22 2V18L18 22L22 26V42L2 22Z" fill="currentColor" />
                  <path d="M26 22L62 2V42L26 22Z" fill="currentColor" />
                </svg>
                <p className="font-dm text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-[#F48FB1]">
                  Tarapoto · San Martín · Preventa Oficial
                </p>
              </div>

              <h1 className="font-geista font-normal text-4xl sm:text-6xl lg:text-[4.4rem] text-white leading-[1.06] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
                <span>Un paraíso terrenal en el corazón verde de </span>
                <span className="italic text-[#F48FB1]">Tarapoto</span>
              </h1>

              <p className="font-dm text-base sm:text-lg text-[#F5F1FA]/90 max-w-2xl leading-relaxed drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]">
                Lotes residenciales de <strong>160 m² y 200 m²</strong> con{' '}
                <strong>título de propiedad</strong> y <strong>entrega inmediata</strong>, a solo 30
                metros del Colegio Virgen Dolorosa y rodeados por la majestuosa Cordillera Escalera.
              </p>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 font-dm text-xs font-bold uppercase tracking-[0.2em] text-white/95">
                <span>160 M² Y 200 M²</span>
                <span>·</span>
                <span>AGUA · DESAGÜE · LUZ</span>
                <span>·</span>
                <span>PROL. JR. CUZCO S/N</span>
              </div>
            </div>

            {/* Bottom-Left Scroll Down Indicator */}
            <div className="absolute bottom-10 left-6 sm:left-14 lg:left-20 flex items-center gap-3 text-white/90">
              <svg width="36" height="22" viewBox="0 0 46 28" fill="none" aria-hidden="true">
                <path
                  d="M5 5L23 22L41 5"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  strokeLinecap="square"
                />
              </svg>
              <span className="font-dm text-[11px] uppercase tracking-[0.24em] text-[#EAE3F2]/85">
                Desliza para recorrer el proyecto
              </span>
            </div>
          </div>

          {/* Unobstructed Canvas Phase Caption (20%..80% scroll) */}
          <div
            ref={midCaptionRef}
            style={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-10 left-6 sm:left-14 lg:left-20 z-20 max-w-xl transition-opacity duration-150"
          >
            <div className="border-l-2 border-[#EE6B96] pl-5 py-2 bg-[#23112B]/70 backdrop-blur-md pr-6 rounded-r-xl">
              <span className="font-dm text-[11px] font-bold uppercase tracking-[0.28em] text-[#F48FB1] block">
                {`ETAPA ${activePhase.num} / 04 · ${activePhase.label}`}
              </span>
              <p className="font-geista text-2xl sm:text-3xl text-white mt-0.5">
                {activePhase.detail}
              </p>
            </div>
          </div>

          {/* Closing Statement Curtain (82%..100% scroll) */}
          <div
            ref={outroCurtainRef}
            style={{ opacity: 0, pointerEvents: 'none' }}
            className="absolute inset-0 z-30 bg-[#361D42] flex flex-col items-center justify-center px-6 text-center"
          >
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-32 sm:h-40 w-auto object-contain mb-8"
            />
            <h2 className="font-geista font-normal text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight max-w-4xl">
              <span>{'Tu espacio, tu inversión, '}</span>
              <span className="italic text-[#F48FB1]">tu legado en la Amazonía</span>
            </h2>
            <p className="mt-4 font-dm text-xs sm:text-sm uppercase tracking-[0.26em] text-[#EAE3F2]/80">
              Preventa Exclusiva en Tarapoto · Lotes de 160 m² y 200 m² con Título de Propiedad
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
