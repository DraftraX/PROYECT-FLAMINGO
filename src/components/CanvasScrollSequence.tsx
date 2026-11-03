import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAMINGO_BRAND } from '../config/flamingo';

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

  const [activePhaseIdx, setActivePhaseIdx] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const PHASES = [
    {
      num: '01',
      label: 'REPLANTEO Y LOTIZACIÓN',
      detail: 'Lotes independizados de 160 m² (8m × 20m) y 200 m² (10m × 20m)',
    },
    {
      num: '02',
      label: 'HABILITACIÓN URBANA INTEGRAL',
      detail: 'Redes ejecutadas de agua potable, desagüe y alumbrado público',
    },
    {
      num: '03',
      label: 'ENTORNO EDUCATIVO CONSOLIDADO',
      detail: 'Ubicación estratégica a solo 30 metros del Colegio Virgen Dolorosa',
    },
    {
      num: '04',
      label: 'ENTREGA INMEDIATA CON TÍTULO',
      detail: 'Pórtico monumental construido y propiedad lista para construir',
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

  // Preload 150 frames progressively without blocking initial paint
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

  // GSAP ScrollTrigger Pinned Sequence (PeruBuilds Portal Scale + Clean Scrubbing + Closing Curtain)
  useEffect(() => {
    const section = sectionRef.current;
    const pinStage = pinStageRef.current;
    if (!section || !pinStage) return;

    const state = { progress: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=340%',
        pin: pinStage,
        scrub: 0.45,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          state.progress = p;

          // Map 0%..84% scroll to frames 1..150 so the full construction finishes before the closing curtain
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

          // 1. PeruBuilds Geometric Architectural Portal (scales 1 -> 12 and fades out between 0%..28%)
          if (portalOverlayRef.current) {
            const portalT = Math.min(1, Math.max(0, p / 0.28));
            const scaleVal = 1 + Math.pow(portalT, 2.1) * 11;
            const opacityVal = Math.max(0, 1 - Math.pow(portalT, 1.5) * 1.15);
            portalOverlayRef.current.style.transform = `scale(${scaleVal.toFixed(3)})`;
            portalOverlayRef.current.style.opacity = String(opacityVal.toFixed(3));
            portalOverlayRef.current.style.visibility = opacityVal <= 0.01 ? 'hidden' : 'visible';
          }

          // 2. Hero Left-Aligned Editorial Typography (fades & glides up between 0%..20%)
          if (heroCopyRef.current) {
            const copyT = Math.min(1, Math.max(0, p / 0.2));
            heroCopyRef.current.style.opacity = String((1 - copyT).toFixed(3));
            heroCopyRef.current.style.transform = `translate3d(0, ${(-copyT * 48).toFixed(1)}px, 0)`;
            heroCopyRef.current.style.visibility = copyT >= 0.99 ? 'hidden' : 'visible';
          }

          // 3. Minimalist Bottom-Left Phase Indicator during unobstructed canvas scrubbing (22%..80%)
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

          if (p < 0.36) setActivePhaseIdx(0);
          else if (p < 0.54) setActivePhaseIdx(1);
          else if (p < 0.7) setActivePhaseIdx(2);
          else setActivePhaseIdx(3);

          // 4. PeruBuilds Closing Statement Curtain (82%..100%)
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
    { label: 'Proyecto', id: 'proyecto' },
    { label: 'Servicios', id: 'servicios' },
    { label: 'Lotizador 360°', id: 'lotizador-360' },
    { label: 'Aledaños', id: 'aledanos' },
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
    <section ref={sectionRef} className="relative w-full bg-[#23112B] select-none">
      {/* =====================================================================
          FIXED TOP ARCHITECTURAL NAVBAR + VERTICAL "HABLEMOS" TAB (PERUBUILDS)
         ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center">
          {/* Brand Block */}
          <a
            href="#top"
            className="pointer-events-auto flex items-center gap-3 bg-[#361D42]/90 backdrop-blur-md px-6 py-4 h-20 border-b border-white/10"
          >
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-11 w-auto object-contain"
            />
          </a>

          {/* Square Menu Toggle (PeruBuilds style) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir menú de navegación"
            className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center gap-1.5 bg-[#190B20] text-white transition-colors hover:bg-[#EE6B96] hover:text-[#23112B] cursor-pointer"
          >
            <span className="h-0.5 w-6 bg-current transition-transform" />
            <span className="h-0.5 w-6 bg-current transition-transform" />
          </button>

          {/* Clean Horizontal Text Links (visible inside Hero, just like PeruBuilds) */}
          <nav
            style={{ opacity: activePhaseIdx === 0 ? 1 : 0, pointerEvents: activePhaseIdx === 0 ? 'auto' : 'none' }}
            className="hidden lg:flex items-center gap-9 pl-10 transition-opacity duration-300"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="font-dm text-sm font-medium tracking-wide text-white/90 hover:text-[#EE6B96] transition-colors cursor-pointer drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Fixed Vertical Tab ("Hablemos" — PeruBuilds signature) */}
        <button
          type="button"
          onClick={() => handleNavClick('contacto')}
          className="pointer-events-auto fixed right-0 top-0 z-50 flex h-48 w-14 items-center justify-center rounded-bl-xl bg-[#EE6B96] text-[#23112B] font-dm text-xs font-bold uppercase tracking-[0.22em] transition-colors hover:bg-[#F48FB1] shadow-lg cursor-pointer"
        >
          <span className="-rotate-90 whitespace-nowrap">Hablemos</span>
        </button>
      </header>

      {/* Mobile / Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#23112B]/98 backdrop-blur-xl flex flex-col justify-center px-10 sm:px-20">
          <div className="max-w-4xl space-y-6">
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-[#EE6B96]">
              Flamingo Residencial · Navegación
            </p>
            <div className="flex flex-col items-start gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className="font-geista text-4xl sm:text-6xl text-white hover:text-[#EE6B96] transition-colors text-left cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-8 border-t border-white/15 flex flex-wrap gap-8 text-sm text-[#EAE3F2]/80 font-dm">
              <span>Lotes de 160 m² y 200 m²</span>
              <span>A 30m del Colegio Virgen Dolorosa</span>
              <span>940 152 191 · 942 710 250</span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PINNED 100VH STAGE
         ===================================================================== */}
      <div ref={pinStageRef} className="relative w-full h-screen overflow-hidden bg-[#23112B]">
        {/* Full-bleed Canvas Sequence (150 frames .webp) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Subtle Dark Vignette for Typographic Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#23112B]/65 via-[#23112B]/25 to-transparent pointer-events-none" />

        {/* ===================================================================
            LAYER 1: PERUBUILDS GEOMETRIC FROSTED PORTAL (scales out on scroll)
           =================================================================== */}
        <div
          ref={portalOverlayRef}
          className="absolute inset-0 z-10 pointer-events-none origin-center will-change-transform"
        >
          {/* Left Frosted Chevron Wing */}
          <div
            className="absolute inset-0 bg-[#361D42]/45 backdrop-blur-[6px]"
            style={{
              clipPath: 'polygon(0% 0%, 16% 0%, 56% 68%, 34% 100%, 0% 100%)',
            }}
          />
          {/* Top-Right Frosted Triangle */}
          <div
            className="absolute inset-0 bg-[#EAE3F2]/20 backdrop-blur-[5px]"
            style={{
              clipPath: 'polygon(52% 0%, 96% 0%, 75% 38%)',
            }}
          />
        </div>

        {/* ===================================================================
            LAYER 2: CLEAN LEFT-ALIGNED EDITORIAL HERO COPY (PeruBuilds style)
           =================================================================== */}
        <div
          ref={heroCopyRef}
          className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-14 lg:px-20 flex flex-col justify-center pointer-events-none will-change-transform"
        >
          <div className="max-w-3xl space-y-8 pt-12">
            <h1 className="font-dm font-bold text-4xl sm:text-6xl lg:text-[4.35rem] text-white leading-[1.05] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              Lotes residenciales,
              <br />
              título propio y
              <br />
              <span className="font-geista font-normal italic text-[#F48FB1]">
                entrega inmediata
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-2 font-dm text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-white/95">
              <span>160 M² Y 200 M²</span>
              <span>AGUA · DESAGÜE · LUZ</span>
              <span>A 30M COLEGIO VIRGEN DOLOROSA</span>
            </div>
          </div>

          {/* Geometric Chevron Accents (PeruBuilds signature) */}
          <div className="hidden lg:block absolute right-28 top-1/3 text-white/90">
            <svg width="110" height="72" viewBox="0 0 110 72" fill="none">
              <path
                d="M8 58L30 36L52 58L74 36L96 58"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="square"
              />
              <path
                d="M44 28L66 8L88 28"
                stroke="#EE6B96"
                strokeWidth="8"
                strokeLinecap="square"
              />
            </svg>
          </div>

          {/* Bottom-Left Scroll Down Chevron */}
          <div className="absolute bottom-10 left-6 sm:left-14 lg:left-20">
            <svg width="46" height="28" viewBox="0 0 46 28" fill="none">
              <path
                d="M5 5L23 22L41 5"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="square"
              />
            </svg>
          </div>
        </div>

        {/* ===================================================================
            LAYER 3: UNOBSTRUCTED CANVAS PHASE CAPTION (20%..80% scroll)
           =================================================================== */}
        <div
          ref={midCaptionRef}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute bottom-10 left-6 sm:left-14 lg:left-20 z-20 max-w-xl transition-opacity duration-150"
        >
          <div className="border-l-2 border-[#EE6B96] pl-5 py-1 bg-[#23112B]/65 backdrop-blur-md pr-6">
            <span className="font-dm text-[11px] font-bold uppercase tracking-[0.28em] text-[#F48FB1] block">
              ETAPA {activePhase.num} / 04 · {activePhase.label}
            </span>
            <p className="font-geista text-2xl sm:text-3xl text-white mt-0.5">
              {activePhase.detail}
            </p>
          </div>
        </div>

        {/* ===================================================================
            LAYER 4: PERUBUILDS CLOSING STATEMENT CURTAIN (82%..100% scroll)
           =================================================================== */}
        <div
          ref={outroCurtainRef}
          style={{ opacity: 0, pointerEvents: 'none' }}
          className="absolute inset-0 z-30 bg-[#361D42] flex flex-col items-center justify-center px-6 text-center"
        >
          <img
            src={FLAMINGO_BRAND.logos.lightText}
            alt="Flamingo Residencial"
            className="h-24 sm:h-28 w-auto object-contain mb-8"
          />
          <h2 className="font-dm font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight max-w-4xl">
            Tu espacio, tu inversión,{' '}
            <span className="font-geista font-normal italic text-[#F48FB1]">tu futuro</span>
          </h2>
          <p className="mt-4 font-dm text-xs sm:text-sm uppercase tracking-[0.26em] text-[#EAE3F2]/75">
            Preventa Exclusiva · Lotes de 160 m² y 200 m² con Título de Propiedad
          </p>
        </div>
      </div>
    </section>
  );
};
