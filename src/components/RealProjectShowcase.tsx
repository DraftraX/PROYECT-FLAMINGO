import React, { useRef, useState } from 'react';
import {
  buildFlamingoWhatsAppUrl,
  FLAMINGO_BRAND,
  TARAPOTO_VIDEO_CHAPTERS,
} from '../config/flamingo';

interface TransformationZone {
  id: string;
  num: string;
  title: string;
  description: string;
  realImg: string;
  visionImg: string;
  videoUrl: string;
}

const TRANSFORMATION_ZONES: TransformationZone[] = [
  {
    id: 'portico',
    num: '01',
    title: 'Pórtico de Ingreso en Piedra y Madera',
    description:
      'Estructura monumental ejecutada en piedra laja, concreto arquitectónico y portón de madera dura en Prolongación Jr. Cuzco s/n, Tarapoto.',
    realImg: '/drive/2d/img-0760.webp',
    visionImg: '/drive/2d/vision-portico.webp',
    videoUrl: '/videos/transform-portico.webm',
  },
  {
    id: 'avenida',
    num: '02',
    title: 'Avenida Principal · Lotes de 160 m² y 200 m²',
    description:
      'Vía central trazada con cajas domiciliarias de agua potable instaladas a pie de lote y proyección residencial de 2 niveles.',
    realImg: '/drive/2d/img-0702.webp',
    visionImg: '/drive/2d/vision-avenue.webp',
    videoUrl: '/videos/transform-avenue.webm',
  },
  {
    id: 'parque',
    num: '03',
    title: 'Parque Central de Palmeras y Recreación',
    description:
      'Alameda central con palmeras adultas conservadas y área de recreación pública de 1,134.66 m² frente a su consolidación paisajística.',
    realImg: '/drive/2d/img-0751.webp',
    visionImg: '/drive/2d/vision-park.webp',
    videoUrl: '/videos/transform-park.webm',
  },
];

const ALEDANOS_ITEMS = [
  {
    src: '/drive/2d/img-0752.webp',
    title: 'A 30 metros del Colegio Virgen Dolorosa',
    subtitle:
      'Conexión inmediata con infraestructura educativa consolidada en Tarapoto desde el pórtico principal.',
  },
  {
    src: '/drive/2d/img-0760.webp',
    title: 'Pórtico Principal en Piedra y Madera',
    subtitle: 'Acceso controlado 100% construido sobre Prolongación Jr. Cuzco s/n.',
  },
  {
    src: '/drive/2d/img-0702.webp',
    title: 'Cajas de Agua y Lotes Estacados',
    subtitle:
      'Parcelas de 160 m² (8m × 20m) y 200 m² (10m × 20m) listas para entrega inmediata.',
  },
  {
    src: '/drive/2d/img-0710.webp',
    title: 'Red de Desagüe y Buzones en Vía',
    subtitle: 'Saneamiento físico ejecutado en el eje vial para respaldo de tu inversión.',
  },
];

export const RealProjectShowcase: React.FC = () => {
  // Documentary Video State
  const docVideoRef = useRef<HTMLVideoElement | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isPlayingDoc, setIsPlayingDoc] = useState(true);
  const [isMutedDoc, setIsMutedDoc] = useState(true);
  const [videoProgressPct, setVideoProgressPct] = useState(0);

  // Comparator State
  const [activeZoneIdx, setActiveZoneIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);

  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const currentZone = TRANSFORMATION_ZONES[activeZoneIdx] || TRANSFORMATION_ZONES[0];
  const currentChapter = TARAPOTO_VIDEO_CHAPTERS[activeChapterIdx] || TARAPOTO_VIDEO_CHAPTERS[0];

  const handleTimeUpdate = () => {
    const v = docVideoRef.current;
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

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIdx(idx);
    const ch = TARAPOTO_VIDEO_CHAPTERS[idx];
    const v = docVideoRef.current;
    if (v && ch) {
      v.currentTime = ch.startSec + 0.05;
      v.muted = false;
      setIsMutedDoc(false);
      v.play()
        .then(() => setIsPlayingDoc(true))
        .catch(() => {});
    }
  };

  const toggleDocPlay = () => {
    const v = docVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => setIsPlayingDoc(true))
        .catch(() => {});
    } else {
      v.pause();
      setIsPlayingDoc(false);
    }
  };

  const toggleDocMute = () => {
    const v = docVideoRef.current;
    if (!v) return;
    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setIsMutedDoc(nextMuted);
    if (!nextMuted && v.paused) {
      v.play()
        .then(() => setIsPlayingDoc(true))
        .catch(() => {});
    }
  };

  const updateSplitFromClientX = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    setSplitPercent(Math.max(5, Math.min(95, pct)));
  };

  return (
    <>
      {/* =====================================================================
          1. SECCIÓN DOCUMENTAL EN VIDEO: MARAVILLAS DE TARAPOTO + FLAMINGO
             (Inspirado en el bloque de video y bienestar de Selva Profunda)
         ===================================================================== */}
      <section
        id="tarapoto-video"
        className="bg-[#23112B] text-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Editorial Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4 gsap-editorial-reveal">
            <span className="inline-block font-dm text-xs font-bold uppercase tracking-[0.28em] text-[#F48FB1]">
              EL NUEVO EPICENTRO DEL BIENESTAR EN LA AMAZONÍA
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-white leading-[1.08]">
              <span>Maravillas de Tarapoto, </span>
              <span className="italic text-[#F48FB1]">Cordillera Escalera</span>
              <span> y Residencial Flamingo</span>
            </h2>
            <p className="font-dm text-base sm:text-lg text-[#EAE3F2]/80 leading-relaxed">
              Explora en este recorrido audiovisual con voz narrada las montañas nubosas de la
              Cordillera Escalera, las aguas de Ahuashiyacu y la Laguna Azul, su fauna y flora, y el
              vuelo real en dron sobre tu futuro lote en Tarapoto.
            </p>
          </div>

          {/* Interactive Chapter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 gsap-editorial-reveal">
            {TARAPOTO_VIDEO_CHAPTERS.map((ch, idx) => {
              const active = idx === activeChapterIdx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChapter(idx)}
                  className={`rounded-full px-4 sm:px-5 py-2.5 font-dm text-xs font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96] ${
                    active
                      ? 'bg-[#EE6B96] text-[#23112B]'
                      : 'bg-[#361D42]/80 text-[#EAE3F2]/85 hover:bg-[#361D42] hover:text-white border border-white/10'
                  }`}
                >
                  <span className={active ? 'text-[#23112B]/75' : 'text-[#F48FB1]'}>{ch.num}</span>
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* 16:9 Cinema Frame with Live Chapter Overlay & Voiceover Control */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-[#160A1C] border border-white/15 shadow-2xl gsap-editorial-reveal">
            <video
              ref={docVideoRef}
              poster="/videos/tarapoto-flamingo-poster.webp"
              autoPlay
              muted={isMutedDoc}
              loop
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onClick={toggleDocPlay}
              className="h-full w-full object-cover cursor-pointer"
            >
              <source src="/videos/tarapoto-flamingo-reel.webm" type="video/webm" />
              <source src="/videos/tarapoto-flamingo-reel.mp4" type="video/mp4" />
            </video>

            {/* Top Minimalist Bar inside Video */}
            <div className="pointer-events-none absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-full bg-[#23112B]/85 backdrop-blur-md border border-white/15 px-4 py-1.5">
                <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F1FA]">
                  {`Capítulo ${currentChapter.num} · ${currentChapter.label}`}
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleDocMute}
                  className={`rounded-full px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isMutedDoc
                      ? 'bg-[#EE6B96] text-[#23112B] hover:bg-[#F48FB1]'
                      : 'bg-white text-[#23112B] hover:bg-[#EAE3F2]'
                  }`}
                >
                  {isMutedDoc ? 'Escuchar con voz' : 'Silenciar voz'}
                </button>

                <button
                  type="button"
                  onClick={toggleDocPlay}
                  className="rounded-full bg-[#23112B]/85 backdrop-blur-md border border-white/20 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#EE6B96] hover:text-[#23112B] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6B96]"
                >
                  {isPlayingDoc ? 'Pausar' : 'Reproducir'}
                </button>
              </div>
            </div>

            {/* Bottom Editorial Caption Overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#190B20]/95 via-[#190B20]/65 to-transparent pt-16 pb-6 px-6 sm:px-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl space-y-1.5">
                  <h3 className="font-geista font-normal text-2xl sm:text-4xl text-white leading-tight">
                    {currentChapter.title}
                  </h3>
                  <p className="font-dm text-xs sm:text-sm text-[#EAE3F2]/85 leading-relaxed">
                    {currentChapter.description}
                  </p>
                </div>

                <a
                  href={buildFlamingoWhatsAppUrl(
                    0,
                    'Hola Flamingo Residencial, acabo de ver el video sobre Tarapoto y el proyecto. Deseo recibir el brochure y precios de preventa.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto shrink-0 self-start md:self-auto rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] px-6 py-2.5 font-dm text-xs font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Solicitar Brochure
                </a>
              </div>

              {/* Timeline Progress Bar */}
              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  style={{ width: `${videoProgressPct.toFixed(1)}%` }}
                  className="h-full bg-[#EE6B96] transition-all duration-150"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SECCIÓN "ARQUITECTURA Y URBANISMO EN ARMONÍA" (COMPARADOR EN OBRA)
         ===================================================================== */}
      <section id="proyecto" className="bg-white pt-24 pb-28 px-6 sm:px-14 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* 2-Column Editorial Layout (Selva Profunda "Arquitectura Ancestral" + Comparator) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center gsap-editorial-reveal">
            {/* Left 5 Columns: Clean Editorial Copy + Zone Selector */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block font-dm text-xs font-bold uppercase tracking-[0.24em] text-[#515B1B]">
                URBANISMO PLANIFICADO EN TARAPOTO
              </span>

              <h2 className="font-geista font-normal text-4xl sm:text-5xl text-[#361D42] leading-[1.08]">
                <span>Arquitectura residencial en armonía con la </span>
                <span className="italic text-[#EE6B96]">selva alta</span>
              </h2>

              <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
                Cada rincón de <strong>{FLAMINGO_BRAND.name}</strong> ha sido diseñado para
                integrarse con el paisaje de Tarapoto, conservando palmeras reales y priorizando la
                ventilación cruzada, la iluminación natural y el confort familiar en lotes de{' '}
                <strong>160 m² y 200 m²</strong>.
              </p>

              <p className="font-dm text-sm text-[#361D42]/75 leading-relaxed">
                Desliza el comparador interactivo para contrastar el avance real ejecutado hoy en
                obra frente a su proyección arquitectónica:
              </p>

              {/* Minimalist Tab List (01, 02, 03) */}
              <div className="border-t border-[#361D42]/12 pt-4 space-y-2">
                {TRANSFORMATION_ZONES.map((zone, idx) => {
                  const active = idx === activeZoneIdx;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setActiveZoneIdx(idx)}
                      className={`w-full text-left py-3 px-4 rounded-xl transition-colors flex items-center justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#361D42] ${
                        active
                          ? 'bg-[#EAE3F2] text-[#361D42] font-bold'
                          : 'text-[#361D42]/70 hover:bg-[#F5F1FA] hover:text-[#361D42]'
                      }`}
                    >
                      <span className="font-dm text-sm">
                        <strong className="text-[#EE6B96] mr-3">{zone.num}</strong>
                        <span>{zone.title}</span>
                      </span>
                      <span className="font-dm text-[11px] uppercase tracking-widest text-[#361D42]/60">
                        {active ? 'Activa' : 'Ver'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="font-dm text-xs text-[#361D42]/70 leading-relaxed pt-1">
                {currentZone.description}
              </p>
            </div>

            {/* Right 7 Columns: Clean Architectural Comparator / Video Frame */}
            <div className="lg:col-span-7 space-y-4">
              <div
                ref={stageRef}
                onPointerDown={(e) => {
                  if (showVideo) return;
                  isDraggingRef.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  updateSplitFromClientX(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (showVideo || !isDraggingRef.current) return;
                  updateSplitFromClientX(e.clientX);
                }}
                onPointerUp={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }
                  isDraggingRef.current = false;
                }}
                className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F5F1FA] select-none shadow-lg ${
                  !showVideo ? 'cursor-ew-resize touch-none' : ''
                }`}
              >
                {/* Persistent Comparator Layer */}
                <div
                  className={`
                    absolute inset-0 transition-opacity duration-200
                    ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                  `}
                >
                  <img
                    src={currentZone.visionImg}
                    alt={`${currentZone.title} · Proyección`}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <img
                    src={currentZone.realImg}
                    alt={`${currentZone.title} · Obra Real`}
                    style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />

                  {/* Clean Minimalist Divider Line */}
                  <div
                    style={{ left: `${splitPercent}%` }}
                    className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white"
                  >
                    <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#361D42] shadow-md font-dm text-xs font-bold">
                      ↔
                    </div>
                  </div>

                  <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-[#23112B]/85 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    Obra Real Hoy
                  </span>
                  <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-[#361D42]">
                    Proyección
                  </span>
                </div>

                {/* Persistent Video Wrapper Layer */}
                <div
                  className={`
                    absolute inset-0 transition-opacity duration-200
                    ${showVideo ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none -z-10'}
                  `}
                >
                  {showVideo && (
                    <video
                      key={currentZone.videoUrl}
                      src={currentZone.videoUrl}
                      poster={currentZone.visionImg}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Clean Footer Strip Below Frame */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-dm text-[#361D42]/75 px-1">
                <span>
                  {showVideo
                    ? 'Reproduciendo secuencia Google Flow de transformación en alta definición'
                    : 'Arrastra la línea central para comparar Obra Real vs. Proyección'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className="font-bold uppercase tracking-[0.16em] text-[#361D42] hover:text-[#EE6B96] underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#361D42]"
                >
                  {showVideo ? 'Volver al Comparador' : 'Ver Video de Transformación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN "REGISTRO REAL EN TERRENO" (2-COL PHOTOGRAPHY GRID)
         ===================================================================== */}
      <section id="aledanos" className="bg-[#F5F1FA] py-24 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 gsap-editorial-reveal">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.24em] text-[#515B1B]">
              TRANSPARENCIA Y SEGURIDAD JURÍDICA
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42]">
              <span>Obra Real y </span>
              <span className="italic text-[#EE6B96]">Entorno Consolidado</span>
            </h2>
            <p className="font-dm text-base text-[#361D42]/75 max-w-2xl mx-auto">
              Registro fotográfico real en Prolongación Jr. Cuzco s/n, a solo 30 metros del Colegio
              Virgen Dolorosa en Tarapoto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gsap-editorial-reveal">
            {ALEDANOS_ITEMS.map((item) => (
              <figure key={item.title} className="space-y-4 group">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#EAE3F2] shadow-sm">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="space-y-1 px-1">
                  <h3 className="font-geista text-2xl text-[#23112B]">{item.title}</h3>
                  <p className="font-dm text-sm text-[#361D42]/75 leading-relaxed">
                    {item.subtitle}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
