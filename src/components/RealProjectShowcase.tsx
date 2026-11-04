import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FLAMINGO_BRAND,
  OBRA_EVIDENCE_PILLS,
  TARAPOTO_VIDEO_CHAPTERS,
} from '../config/flamingo';
import type { InterestOption } from './ContactDrawer';

gsap.registerPlugin(ScrollTrigger);

interface RealProjectShowcaseProps {
  onOpenContactDrawer: (interest?: InterestOption, lotNote?: string) => void;
}

export const RealProjectShowcase: React.FC<RealProjectShowcaseProps> = ({
  onOpenContactDrawer,
}) => {
  // Sección A: Video Showcase + Audio Narration State
  const sectionARef = useRef<HTMLElement | null>(null);
  const cinemaFrameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgressPct, setVideoProgressPct] = useState(0);

  // Sección B: Locket Fan Cards + Evidence Widget State
  const sectionBRef = useRef<HTMLElement | null>(null);
  const fanContainerRef = useRef<HTMLDivElement | null>(null);
  const card160Ref = useRef<HTMLDivElement | null>(null);
  const card200Ref = useRef<HTMLDivElement | null>(null);

  const [activePillIdx, setActivePillIdx] = useState(0);
  const [showVisionMode, setShowVisionMode] = useState(false);

  const currentChapter =
    TARAPOTO_VIDEO_CHAPTERS[activeChapterIdx] || TARAPOTO_VIDEO_CHAPTERS[0];
  const currentEvidence =
    OBRA_EVIDENCE_PILLS[activePillIdx] || OBRA_EVIDENCE_PILLS[0];

  // ScrollTrigger animations for Sección A (Cinema Frame) and Sección B (Fan Cards)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cinemaFrameRef.current) {
        gsap.fromTo(
          cinemaFrameRef.current,
          {
            scale: 0.9,
            rotate: -1.5,
            y: 36,
          },
          {
            scale: 1,
            rotate: 0,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cinemaFrameRef.current,
              start: 'top 88%',
              end: 'top 32%',
              scrub: 0.65,
            },
          }
        );
      }

      if (fanContainerRef.current && card160Ref.current && card200Ref.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: fanContainerRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.fromTo(
          card160Ref.current,
          {
            x: 48,
            y: 28,
            rotate: 5,
            scale: 0.92,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: -1.6,
            scale: 1,
            opacity: 1,
            duration: 0.95,
            ease: 'back.out(1.65)',
          },
          0
        ).fromTo(
          card200Ref.current,
          {
            x: -48,
            y: 28,
            rotate: -5,
            scale: 0.92,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: 1.6,
            scale: 1,
            opacity: 1,
            duration: 0.95,
            ease: 'back.out(1.65)',
          },
          0.08
        );
      }
    });

    return () => {
      ctx.revert();
    };
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const t = v.currentTime;
    setVideoProgressPct(Math.min(100, Math.max(0, (t / v.duration) * 100)));

    const foundIdx = TARAPOTO_VIDEO_CHAPTERS.findIndex(
      (ch) => t >= ch.startSec && t <= ch.endSec
    );
    if (foundIdx !== -1 && foundIdx !== activeChapterIdx) {
      setActiveChapterIdx(foundIdx);
    }
  };

  const handleToggleAudioTour = () => {
    const v = videoRef.current;
    if (!v) return;

    if (!isAudioActive) {
      // Unmute and synchronize audio tour
      v.muted = false;
      v.volume = 1.0;
      if (v.currentTime > 47) {
        v.currentTime = 0;
      }
      v.play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioActive(true);
        })
        .catch(() => {});
    } else {
      v.muted = true;
      setIsAudioActive(false);
    }
  };

  const handleRestartWithAudio = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.volume = 1.0;
    setActiveChapterIdx(0);
    v.play()
      .then(() => {
        setIsPlaying(true);
        setIsAudioActive(true);
      })
      .catch(() => {});
  };

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIdx(idx);
    const ch = TARAPOTO_VIDEO_CHAPTERS[idx];
    const v = videoRef.current;
    if (v && ch) {
      v.currentTime = ch.startSec + 0.05;
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleCardPointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    baseRotate: number
  ) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

    gsap.to(el, {
      rotateY: nx * 9,
      rotateX: -ny * 7,
      rotateZ: baseRotate + nx * 1.5,
      y: -6,
      duration: 0.35,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  };

  const handleCardPointerLeave = (
    e: React.PointerEvent<HTMLDivElement>,
    baseRotate: number
  ) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      rotateZ: baseRotate,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.6)',
    });
  };

  return (
    <>
      {/* =====================================================================
          SECCIÓN A: SHOWCASE CINEMÁTICO CON NARRACIÓN DE AUDIO
          ("El Entorno que Valoriza tu Lote" · Estilo Seesaw / Locket)
         ===================================================================== */}
      <section
        id="entorno-tarapoto"
        ref={sectionARef}
        className="bg-[#F5F1FA] py-20 sm:py-28 px-4 sm:px-10 lg:px-16 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Compact Editorial Header (Economy of Words) */}
          <div className="max-w-2xl mx-auto text-center space-y-3 gsap-editorial-reveal">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#361D42]/10 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.22em] text-[#515B1B] shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#EE6B96]" />
              <span>CÁPSULA DOCUMENTAL CON AUDIO NARRADO</span>
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42] leading-[1.04]">
              <span>El entorno que </span>
              <span className="italic text-[#EE6B96]">valoriza tu lote</span>
            </h2>
            <p className="font-dm text-sm sm:text-base text-[#361D42]/75 leading-relaxed">
              Cordillera Escalera, Catarata de Ahuashiyacu, Laguna Azul y vuelo real sobre{' '}
              <strong className="text-[#361D42]">Flamingo Residencial</strong> en una sola
              experiencia audiovisual.
            </p>
          </div>

          {/* Seesaw / Locket Rounded-[36px] Cinema Container */}
          <div
            ref={cinemaFrameRef}
            style={{ border: '1px solid rgba(54, 29, 66, 0.08)' }}
            className="relative w-full overflow-hidden rounded-[36px] bg-[#190B20] shadow-[0_32px_90px_-20px_rgba(35,17,43,0.38)] will-change-transform"
          >
            <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden">
              <video
                ref={videoRef}
                poster="/videos/tarapoto-flamingo-poster.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) {
                    v.play().then(() => setIsPlaying(true)).catch(() => {});
                  } else {
                    v.pause();
                    setIsPlaying(false);
                  }
                }}
                className="h-full w-full object-cover cursor-pointer"
              >
                <source src="/videos/tarapoto-flamingo-reel.mp4" type="video/mp4" />
                <source src="/videos/tarapoto-flamingo-reel.webm" type="video/webm" />
              </video>

              {/* Subtle Vignette for Legibility */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#190B20]/90 via-[#190B20]/20 to-[#190B20]/40" />

              {/* Top Floating Bar: Magnetic Audio Pill + Replay Control */}
              <div className="absolute top-4 sm:top-7 left-4 sm:left-7 right-4 sm:right-7 flex flex-wrap items-center justify-between gap-3 z-20">
                {/* Magnetic Audio Pill Button */}
                <button
                  type="button"
                  onClick={handleToggleAudioTour}
                  data-testid="toggle-audio-tour"
                  className={`group inline-flex items-center gap-3 rounded-full px-5 sm:px-6 py-3 font-dm text-xs sm:text-[13px] font-bold tracking-[0.06em] transition-all duration-300 shadow-lg cursor-pointer active:scale-95 ${
                    isAudioActive
                      ? 'bg-[#EE6B96] text-[#23112B] shadow-[0_12px_32px_rgba(238,107,150,0.5)]'
                      : 'bg-white/95 hover:bg-[#361D42] text-[#361D42] hover:text-white border border-white/40'
                  }`}
                >
                  {/* Animated Equalizer Bars */}
                  <span className="flex items-end gap-[3px] h-3.5" aria-hidden="true">
                    <span
                      className={`w-[3px] rounded-full transition-all duration-300 ${
                        isAudioActive
                          ? 'h-3.5 bg-[#23112B] animate-pulse'
                          : 'h-2 bg-[#EE6B96] group-hover:h-3.5'
                      }`}
                    />
                    <span
                      className={`w-[3px] rounded-full transition-all duration-300 ${
                        isAudioActive
                          ? 'h-2.5 bg-[#23112B] animate-bounce'
                          : 'h-3.5 bg-[#EE6B96] group-hover:h-2'
                      }`}
                    />
                    <span
                      className={`w-[3px] rounded-full transition-all duration-300 ${
                        isAudioActive
                          ? 'h-3 bg-[#23112B] animate-pulse'
                          : 'h-1.5 bg-[#EE6B96] group-hover:h-3'
                      }`}
                    />
                    <span
                      className={`w-[3px] rounded-full transition-all duration-300 ${
                        isAudioActive
                          ? 'h-3.5 bg-[#23112B] animate-bounce'
                          : 'h-2.5 bg-[#EE6B96] group-hover:h-3.5'
                      }`}
                    />
                  </span>
                  <span>
                    {isAudioActive
                      ? 'Audio Narrado Activo · Silenciar'
                      : 'Escuchar recorrido por Tarapoto (Audio)'}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  {isAudioActive && (
                    <button
                      type="button"
                      onClick={handleRestartWithAudio}
                      className="rounded-full bg-[#23112B]/80 hover:bg-[#361D42] backdrop-blur-md border border-white/20 px-4 py-2.5 font-dm text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors cursor-pointer"
                    >
                      Reiniciar voz
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const v = videoRef.current;
                      if (!v) return;
                      if (v.paused) {
                        v.play().then(() => setIsPlaying(true)).catch(() => {});
                      } else {
                        v.pause();
                        setIsPlaying(false);
                      }
                    }}
                    className="rounded-full bg-[#23112B]/80 hover:bg-white hover:text-[#23112B] backdrop-blur-md border border-white/20 px-4 py-2.5 font-dm text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? 'Pausa' : 'Play'}
                  </button>
                </div>
              </div>

              {/* Bottom Editorial Voiceover Subtitles & Chapter Pills */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 z-20 space-y-5">
                {/* Live Editorial Subtitle Box */}
                <div className="max-w-3xl space-y-2">
                  <span className="inline-block rounded-full bg-[#EE6B96]/20 border border-[#EE6B96]/40 px-3.5 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.2em] text-[#F48FB1]">
                    {currentChapter.label}
                  </span>
                  <h3 className="font-geista font-normal text-2xl sm:text-4xl text-white leading-tight">
                    {currentChapter.title}
                  </h3>
                  <p className="font-dm text-xs sm:text-sm text-[#EAE3F2]/90 leading-relaxed max-w-2xl">
                    “{currentChapter.subtitle}”
                  </p>
                </div>

                {/* Chapter Pills + Progress Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/15">
                  <div className="flex flex-wrap items-center gap-2">
                    {TARAPOTO_VIDEO_CHAPTERS.map((ch, idx) => {
                      const active = idx === activeChapterIdx;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleSelectChapter(idx)}
                          className={`rounded-full px-4 py-2 font-dm text-xs font-bold tracking-[0.06em] transition-all cursor-pointer ${
                            active
                              ? 'bg-white text-[#23112B] shadow-md'
                              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact Progress Pill */}
                  <div className="w-full sm:w-44 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      style={{ width: `${videoProgressPct.toFixed(1)}%` }}
                      className="h-full bg-[#EE6B96] transition-all duration-150"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN B: ABANICO INTERACTIVO DE LOTES Y OBRA REAL
          (Mecánica Locket Stacked/Fan Cards + Widget Táctil de 4 Píldoras)
         ===================================================================== */}
      <section
        id="abanico-lotes"
        ref={sectionBRef}
        className="bg-white py-20 sm:py-28 px-4 sm:px-10 lg:px-16 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto space-y-20">
          {/* 1. Locket Stacked/Fan Collectible Lot Cards (160 m² & 200 m²) */}
          <div className="space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3 gsap-editorial-reveal">
              <span className="inline-block font-dm text-[11px] font-bold uppercase tracking-[0.24em] text-[#515B1B]">
                COLECCIÓN RESIDENCIAL · ENTREGA INMEDIATA
              </span>
              <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42] leading-[1.05]">
                <span>Elige la escala de </span>
                <span className="italic text-[#EE6B96]">tu próximo hogar</span>
              </h2>
              <p className="font-dm text-sm sm:text-base text-[#361D42]/75">
                Dos metrajes independientes con título de propiedad inscrito y servicios completos a
                pie de lote.
              </p>
            </div>

            <div
              ref={fanContainerRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9 items-stretch max-w-5xl mx-auto"
            >
              {/* Card 1: Lote Estándar · 160 m² */}
              <div
                ref={card160Ref}
                onPointerMove={(e) => handleCardPointerMove(e, -1.6)}
                onPointerLeave={(e) => handleCardPointerLeave(e, -1.6)}
                style={{ border: '1px solid rgba(54, 29, 66, 0.1)' }}
                className="group relative flex flex-col justify-between rounded-[32px] bg-[#F5F1FA] p-7 sm:p-9 shadow-[0_24px_60px_-18px_rgba(54,29,66,0.14)] transition-shadow hover:shadow-[0_30px_75px_-15px_rgba(238,107,150,0.28)]"
              >
                <div className="space-y-6">
                  {/* Top Badge + Dimensions Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#361D42] px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                      Lote Estándar
                    </span>
                    <span className="rounded-full bg-white px-4 py-1.5 font-dm text-xs font-bold text-[#361D42] border border-[#361D42]/10">
                      Frente 8m × Fondo 20m
                    </span>
                  </div>

                  {/* Hero Area Figure */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-geista text-6xl sm:text-7xl text-[#361D42] leading-none">
                      160
                    </span>
                    <span className="font-geista text-3xl sm:text-4xl text-[#EE6B96]">m²</span>
                  </div>

                  {/* Interactive Architectural Preview Frame */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[#23112B]">
                    <img
                      src="/drive/2d/vision-avenue.webp"
                      alt="Lote Estándar de 160 m² en Flamingo Residencial"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#23112B]/70 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3.5 rounded-full bg-white/95 px-3 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.16em] text-[#361D42]">
                      Ideal para residencia familiar con jardín amazónico
                    </span>
                  </div>

                  {/* Concise Tactile Specs */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3.5 py-1.5 font-dm text-xs font-semibold text-[#361D42]">
                      ✓ Título Independizado
                    </span>
                    <span className="rounded-full bg-white px-3.5 py-1.5 font-dm text-xs font-semibold text-[#361D42]">
                      ✓ Entrega Inmediata
                    </span>
                    <span className="rounded-full bg-white px-3.5 py-1.5 font-dm text-xs font-semibold text-[#361D42]">
                      ✓ Agua, Desagüe y Luz
                    </span>
                  </div>
                </div>

                <div className="pt-7 mt-6 border-t border-[#361D42]/10">
                  <button
                    type="button"
                    data-testid="quote-160-btn"
                    onClick={() =>
                      onOpenContactDrawer(
                        'Lote de 160 m² (8m × 20m)',
                        'Lote Estándar · 160 m² (8m × 20m)'
                      )
                    }
                    className="w-full rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white hover:text-[#23112B] py-4 px-6 font-dm text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <span>Cotizar lote de 160 m²</span>
                    <span className="text-base leading-none">→</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Lote Amplio · 200 m² */}
              <div
                ref={card200Ref}
                onPointerMove={(e) => handleCardPointerMove(e, 1.6)}
                onPointerLeave={(e) => handleCardPointerLeave(e, 1.6)}
                style={{ border: '1px solid rgba(238, 107, 150, 0.28)' }}
                className="group relative flex flex-col justify-between rounded-[32px] bg-[#2B1436] text-white p-7 sm:p-9 shadow-[0_28px_70px_-18px_rgba(35,17,43,0.35)] transition-shadow hover:shadow-[0_34px_85px_-15px_rgba(238,107,150,0.4)]"
              >
                <div className="space-y-6">
                  {/* Top Badge + Dimensions Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#EE6B96] px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-[#23112B]">
                      Lote Amplio · Más Solicitado
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-1.5 font-dm text-xs font-bold text-[#F5F1FA] border border-white/15">
                      Frente 10m × Fondo 20m
                    </span>
                  </div>

                  {/* Hero Area Figure */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-geista text-6xl sm:text-7xl text-white leading-none">
                      200
                    </span>
                    <span className="font-geista text-3xl sm:text-4xl text-[#F48FB1]">m²</span>
                  </div>

                  {/* Interactive Architectural Preview Frame */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[#190B20]">
                    <img
                      src="/drive/2d/vision-park.webp"
                      alt="Lote Amplio de 200 m² en Flamingo Residencial"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#190B20]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3.5 rounded-full bg-[#23112B]/90 border border-white/15 px-3 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.16em] text-[#F48FB1]">
                      Mayor frente arquitectónico, piscina y terraza social
                    </span>
                  </div>

                  {/* Concise Tactile Specs */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 border border-white/10 px-3.5 py-1.5 font-dm text-xs font-semibold text-white">
                      ✓ Frente de 10 metros
                    </span>
                    <span className="rounded-full bg-white/10 border border-white/10 px-3.5 py-1.5 font-dm text-xs font-semibold text-white">
                      ✓ Título Independizado
                    </span>
                    <span className="rounded-full bg-white/10 border border-white/10 px-3.5 py-1.5 font-dm text-xs font-semibold text-white">
                      ✓ Entrega Inmediata
                    </span>
                  </div>
                </div>

                <div className="pt-7 mt-6 border-t border-white/12">
                  <button
                    type="button"
                    data-testid="quote-200-btn"
                    onClick={() =>
                      onOpenContactDrawer(
                        'Lote de 200 m² (10m × 20m)',
                        'Lote Amplio · 200 m² (10m × 20m)'
                      )
                    }
                    className="w-full rounded-full bg-[#EE6B96] hover:bg-white text-[#23112B] py-4 px-6 font-dm text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <span>Cotizar lote de 200 m²</span>
                    <span className="text-base leading-none">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Widget Táctil Compacto de Evidencia en Obra (Reemplaza las 4 tarjetas pesadas) */}
          <div
            style={{ border: '1px solid rgba(54, 29, 66, 0.08)' }}
            className="rounded-[36px] bg-[#F5F1FA] p-5 sm:p-8 lg:p-10 shadow-sm gsap-editorial-reveal"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7">
              <div className="space-y-1.5">
                <span className="font-dm text-[11px] font-bold uppercase tracking-[0.22em] text-[#515B1B]">
                  EVIDENCIA FÍSICA VERIFICABLE EN TERRENO
                </span>
                <h3 className="font-geista font-normal text-3xl sm:text-4xl text-[#361D42]">
                  <span>Obra ejecutada hoy en </span>
                  <span className="italic text-[#EE6B96]">Tarapoto</span>
                </h3>
              </div>

              {/* 4 Selectable Tactile Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {OBRA_EVIDENCE_PILLS.map((pill, idx) => {
                  const active = idx === activePillIdx;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onMouseEnter={() => setActivePillIdx(idx)}
                      onClick={() => setActivePillIdx(idx)}
                      className={`rounded-full px-4 py-2.5 font-dm text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                        active
                          ? 'bg-[#361D42] text-white shadow-md scale-[1.02]'
                          : 'bg-white text-[#361D42]/80 hover:bg-[#EAE3F2] hover:text-[#361D42] border border-[#361D42]/10'
                      }`}
                    >
                      {pill.pillLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rounded Photo Frame with Instant Crossfade & Single Short Line */}
            <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden rounded-[28px] bg-[#23112B] shadow-inner">
              {OBRA_EVIDENCE_PILLS.map((pill, idx) => {
                const active = idx === activePillIdx;
                const displaySrc = showVisionMode ? pill.visionImage : pill.image;
                return (
                  <img
                    key={pill.id}
                    src={displaySrc}
                    alt={pill.caption}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      active
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                  />
                );
              })}

              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#190B20]/90 via-transparent to-[#190B20]/30" />

              {/* Top Right Toggle: Foto Real vs Proyección */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full bg-[#23112B]/80 backdrop-blur-md p-1 border border-white/15">
                <button
                  type="button"
                  onClick={() => setShowVisionMode(false)}
                  className={`rounded-full px-3.5 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    !showVisionMode
                      ? 'bg-[#EE6B96] text-[#23112B]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Foto Real Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setShowVisionMode(true)}
                  className={`rounded-full px-3.5 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    showVisionMode
                      ? 'bg-[#EE6B96] text-[#23112B]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Proyección 3D
                </button>
              </div>

              {/* Single Clean Supporting Line at Bottom */}
              <div className="absolute inset-x-0 bottom-0 z-30 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#EE6B96] px-3.5 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.18em] text-[#23112B]">
                    {currentEvidence.badge}
                  </span>
                  <p className="font-dm text-xs sm:text-sm font-medium text-white">
                    {currentEvidence.caption}
                  </p>
                </div>

                <span className="font-dm text-[11px] text-[#EAE3F2]/80">
                  {FLAMINGO_BRAND.locationReference}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
