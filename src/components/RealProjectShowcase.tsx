import React, { useRef, useState } from 'react';

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
    title: 'Pórtico de Ingreso',
    description:
      'Estructura monumental ya ejecutada en piedra laja, concreto arquitectónico y portón de madera dura frente a su proyección iluminada.',
    realImg: '/drive/2d/img-0760.webp',
    visionImg: '/drive/2d/vision-portico.webp',
    videoUrl: '/videos/transform-portico.webm',
  },
  {
    id: 'avenida',
    num: '02',
    title: 'Avenida Principal · 160 m² y 200 m²',
    description:
      'Vía central trazada con cajas domiciliarias de agua potable instaladas a pie de lote y proyección residencial de 2 niveles.',
    realImg: '/drive/2d/img-0702.webp',
    visionImg: '/drive/2d/vision-avenue.webp',
    videoUrl: '/videos/transform-avenue.webm',
  },
  {
    id: 'parque',
    num: '03',
    title: 'Parque Central de Palmeras',
    description:
      'Alameda central con palmeras adultas conservadas y obras civiles en curso frente a su consolidación paisajística.',
    realImg: '/drive/2d/img-0751.webp',
    visionImg: '/drive/2d/vision-park.webp',
    videoUrl: '/videos/transform-park.webm',
  },
];

const ALEDANOS_ITEMS = [
  {
    src: '/drive/2d/img-0752.webp',
    title: 'A 30 metros del Colegio Virgen Dolorosa',
    subtitle: 'Conexión inmediata con infraestructura educativa consolidada desde el pórtico principal.',
  },
  {
    src: '/drive/2d/img-0760.webp',
    title: 'Pórtico Principal en Piedra y Madera',
    subtitle: 'Acceso controlado 100% construido sobre la vía principal del valle.',
  },
  {
    src: '/drive/2d/img-0702.webp',
    title: 'Cajas de Agua y Lotes Estacados',
    subtitle: 'Parcelas de 160 m² (8m × 20m) y 200 m² (10m × 20m) listas para entrega inmediata.',
  },
  {
    src: '/drive/2d/img-0710.webp',
    title: 'Red de Desagüe y Buzones en Vía',
    subtitle: 'Saneamiento físico ejecutado en el eje vial para respaldo de tu inversión.',
  },
];

export const RealProjectShowcase: React.FC = () => {
  const [activeZoneIdx, setActiveZoneIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);

  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const currentZone = TRANSFORMATION_ZONES[activeZoneIdx] || TRANSFORMATION_ZONES[0];

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
          SECCIÓN "NUESTRO PROYECTO" (PERUBUILDS OVERSIZED TYPOGRAPHY + 2-COL)
         ===================================================================== */}
      <section id="proyecto" className="bg-white pt-24 pb-28 px-6 sm:px-14 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Giant PeruBuilds Display Header: "nuestro PROYECTO" */}
          <div className="relative flex flex-col items-center text-center mb-20 gsap-editorial-reveal">
            <a
              href="#contacto"
              className="relative z-10 mb-3 inline-block rounded-lg bg-[#23112B] px-7 py-3.5 font-dm text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#EE6B96] hover:text-[#23112B]"
            >
              Solicitar información
            </a>
            <div className="w-full flex flex-wrap items-baseline justify-center gap-x-6 leading-none select-none">
              <span className="font-geista italic font-normal text-6xl sm:text-8xl lg:text-[7.5rem] text-[#EAE3F2]">
                nuestro
              </span>
              <span className="font-dm font-extrabold text-5xl sm:text-8xl lg:text-[7.2rem] tracking-tight text-[#361D42] uppercase">
                PROYECTO
              </span>
            </div>
          </div>

          {/* 2-Column Editorial Layout (PeruBuilds "Acerca de..." layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center gsap-editorial-reveal">
            {/* Left 5 Columns: Clean Editorial Copy + Zone Selector */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-dm font-bold text-4xl sm:text-5xl text-[#23112B] leading-[1.08] tracking-tight">
                Acerca de
                <br />
                FLAMINGO RESIDENCIAL
              </h2>

              <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
                <strong>Flamingo Residencial</strong> es una urbanización planificada con lotes de{' '}
                <strong>160 m² y 200 m²</strong>, respaldada con <strong>título de propiedad</strong>{' '}
                y <strong>entrega inmediata</strong>.
              </p>

              <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
                Compara el estado real en obra hoy con su proyección arquitectónica deslizando sobre
                las fotografías reales del proyecto:
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
                      className={`w-full text-left py-3 px-4 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-[#EAE3F2] text-[#361D42] font-bold'
                          : 'text-[#361D42]/65 hover:bg-[#F5F1FA] hover:text-[#361D42]'
                      }`}
                    >
                      <span className="font-dm text-sm">
                        <strong className="text-[#EE6B96] mr-3">{zone.num}</strong>
                        <span>{zone.title}</span>
                      </span>
                      <span className="text-xs uppercase tracking-widest">→</span>
                    </button>
                  );
                })}
              </div>

              <p className="font-dm text-xs text-[#361D42]/65 leading-relaxed pt-1">
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
                className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F5F1FA] select-none ${
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
                    alt={`${currentZone.title} — Proyección`}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <img
                    src={currentZone.realImg}
                    alt={`${currentZone.title} — Obra Real`}
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

                  <span className="pointer-events-none absolute bottom-4 left-4 bg-[#23112B]/80 px-3.5 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    Obra Real Hoy
                  </span>
                  <span className="pointer-events-none absolute bottom-4 right-4 bg-white/90 px-3.5 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-[#361D42]">
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
              <div className="flex items-center justify-between text-xs font-dm text-[#361D42]/75 px-1">
                <span>
                  {showVideo
                    ? 'Reproduciendo secuencia de transformación'
                    : 'Arrastra la línea central para comparar Obra Real vs. Proyección'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className="font-bold uppercase tracking-[0.16em] text-[#361D42] hover:text-[#EE6B96] underline underline-offset-4 cursor-pointer"
                >
                  {showVideo ? 'Volver al Comparador' : 'Ver Video de Transformación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN "ALEDAÑOS Y OBRA REAL" (PERUBUILDS 2-COL PHOTOGRAPHY GRID)
         ===================================================================== */}
      <section id="aledanos" className="bg-white py-24 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 gsap-editorial-reveal">
            <h2 className="font-dm font-bold text-4xl sm:text-6xl text-[#23112B] tracking-tight">
              Aledaños y Obra Real
            </h2>
            <p className="font-dm text-base text-[#361D42]/75 max-w-2xl mx-auto">
              Registro fotográfico real en terreno a solo 30 metros del Colegio Virgen Dolorosa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gsap-editorial-reveal">
            {ALEDANOS_ITEMS.map((item) => (
              <figure key={item.title} className="space-y-4 group">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#EAE3F2]">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="space-y-1 px-1">
                  <h3 className="font-dm font-bold text-xl text-[#23112B]">{item.title}</h3>
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
