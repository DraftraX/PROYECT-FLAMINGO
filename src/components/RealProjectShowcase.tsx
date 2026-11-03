import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Film,
  Layers,
  MapPin,
  MoveHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

interface TransformationZone {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  realImg: string;
  visionImg: string;
  videoUrl: string;
  metrics: { label: string; value: string }[];
  hotspots: { x: number; y: number; title: string; detail: string }[];
}

const TRANSFORMATION_ZONES: TransformationZone[] = [
  {
    id: 'portico',
    badge: 'Zona 01 · Acceso Principal',
    title: 'Pórtico de Ingreso Monumental',
    subtitle:
      'Estructura real ya construida en piedra laja, concreto arquitectónico blanco y portón en madera tropical frente a su proyección consolidada.',
    realImg: '/drive/2d/img-0760.webp',
    visionImg: '/drive/2d/vision-portico.webp',
    videoUrl: '/videos/transform-portico.webm',
    metrics: [
      { label: 'Estado Actual', value: 'Pórtico 100% Construido' },
      { label: 'Seguridad', value: 'Control de Acceso y Caseta' },
      { label: 'Conectividad', value: 'A 30m Colegio Virgen Dolorosa' },
    ],
    hotspots: [
      {
        x: 26,
        y: 44,
        title: 'Torre Enchapada en Piedra Laja',
        detail: 'Volumen estructural terminado con caseta de vigilancia integrada.',
      },
      {
        x: 56,
        y: 62,
        title: 'Portón en Madera Dura y Acero',
        detail: 'Ingreso vehicular y peatonal independiente con identidad Flamingo.',
      },
      {
        x: 84,
        y: 34,
        title: 'Alero con Óculos Arquitectónicos',
        detail: 'Diseño contemporáneo con iluminación empotrada prevista.',
      },
    ],
  },
  {
    id: 'avenida',
    badge: 'Zona 02 · Vías y Servicios',
    title: 'Avenida Principal y Lotes de 160 m² y 200 m²',
    subtitle:
      'Trazo vial nivelado con cajas de registro de agua instaladas a pie de lote y proyección de viviendas contemporáneas de 2 niveles.',
    realImg: '/drive/2d/img-0702.webp',
    visionImg: '/drive/2d/vision-avenue.webp',
    videoUrl: '/videos/transform-avenue.webm',
    metrics: [
      { label: 'Metrajes', value: 'Lotes de 160 m² y 200 m²' },
      { label: 'Saneamiento', value: 'Cajas de Agua en Terreno' },
      { label: 'Documentación', value: 'Título de Propiedad' },
    ],
    hotspots: [
      {
        x: 18,
        y: 52,
        title: 'Pórtico Vista Interior',
        detail: 'Conexión directa hacia la vía principal y el Colegio Virgen Dolorosa.',
      },
      {
        x: 10,
        y: 69,
        title: 'Caja de Agua y Lote Vendido',
        detail: 'Punto domiciliario de agua potable y demarcación física de lote.',
      },
      {
        x: 88,
        y: 62,
        title: 'Frentes de 8m y 10m Estacados',
        detail: 'Hitos perimetrales listos para entrega inmediata y construcción.',
      },
    ],
  },
  {
    id: 'parque',
    badge: 'Zona 03 · Áreas Verdes',
    title: 'Parque Central y Boulevard de Palmeras',
    subtitle:
      'Corazón paisajístico del proyecto con palmeras adultas conservadas, sardineles en ejecución y proyección de pérgola social.',
    realImg: '/drive/2d/img-0751.webp',
    visionImg: '/drive/2d/vision-park.webp',
    videoUrl: '/videos/transform-park.webm',
    metrics: [
      { label: 'Paisajismo', value: 'Palmeras Reales en Obra' },
      { label: 'Equipamiento', value: 'Senderos y Jardineras' },
      { label: 'Entorno', value: 'Microclima Natural del Valle' },
    ],
    hotspots: [
      {
        x: 46,
        y: 46,
        title: 'Alameda de Palmeras Reales',
        detail: 'Eje paisajístico central que aporta sombra y valor estético.',
      },
      {
        x: 34,
        y: 57,
        title: 'Sardineles y Jardineras de Ladrillo',
        detail: 'Obras civiles del parque recreativo actualmente en ejecución.',
      },
      {
        x: 83,
        y: 79,
        title: 'Caja de Registro Pluvial / Red',
        detail: 'Infraestructura subterránea integrada al diseño del parque.',
      },
    ],
  },
];

const FIELD_GALLERY = [
  {
    id: 'img-0760',
    src: '/drive/2d/img-0760.webp',
    tag: 'Pórtico Construido',
    title: 'Fachada Principal en Piedra y Madera',
    caption: 'Ingreso real terminado con caseta de control y acceso vehicular.',
  },
  {
    id: 'img-0702',
    src: '/drive/2d/img-0702.webp',
    tag: 'Vía Principal',
    title: 'Avenida de Ingreso y Cajas Domiciliarias',
    caption: 'Lotes estacados con cajas de registro de agua ya instaladas.',
  },
  {
    id: 'img-0710',
    src: '/drive/2d/img-0710.webp',
    tag: 'Red de Desagüe',
    title: 'Buzón de Alcantarillado en Eje Vial',
    caption: 'Infraestructura sanitaria real ejecutada en las vías del proyecto.',
  },
  {
    id: 'img-0751',
    src: '/drive/2d/img-0751.webp',
    tag: 'Parque Central',
    title: 'Obras en Plaza Principal y Palmeras',
    caption: 'Construcción activa de veredas, jardineras y áreas recreativas.',
  },
  {
    id: 'img-0718',
    src: '/drive/2d/img-0718.webp',
    tag: 'Manzanas 160m² / 200m²',
    title: 'Cruces Viales y Lotes Independizados',
    caption: 'Demarcación individual por lote con entrega inmediata.',
  },
  {
    id: 'img-0752',
    src: '/drive/2d/img-0752.webp',
    tag: 'A 30m del Colegio',
    title: 'Conexión Directa al Colegio Virgen Dolorosa',
    caption: 'Vista desde la avenida central hacia el pórtico y el colegio.',
  },
];

export const RealProjectShowcase: React.FC = () => {
  const [activeZoneIdx, setActiveZoneIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'compare' | 'video'>('compare');
  const [splitPercent, setSplitPercent] = useState(52);
  const [activeHotspotIdx, setActiveHotspotIdx] = useState<number | null>(0);
  const [lightboxItem, setLightboxItem] = useState<(typeof FIELD_GALLERY)[0] | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const currentZone = TRANSFORMATION_ZONES[activeZoneIdx] || TRANSFORMATION_ZONES[0];

  const updateSplitFromClientX = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    setSplitPercent(Math.max(6, Math.min(94, pct)));
  };

  return (
    <section
      id="avance-real"
      className="relative overflow-hidden bg-[#EAE3F2] px-5 py-20 sm:px-10 lg:px-16"
    >
      {/* Subtle architectural grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(54,29,66,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(54,29,66,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#361D42] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F5F1FA]">
              <Sparkles size={13} className="text-[#EE6B96]" />
              Realidad en Terreno vs. Visión Consolidada
            </div>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] text-[#361D42] sm:text-6xl">
              Obra real hoy, <span className="italic text-[#EE6B96]">plusvalía</span> mañana
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#361D42]/80 sm:text-base">
            Desliza el comparador o reproduce la secuencia de transformación sobre las fotografías
            reales tomadas en el terreno de <strong>Flamingo Residencial</strong>.
          </p>
        </div>

        {/* Zone Selector Tabs + Mode Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            {TRANSFORMATION_ZONES.map((zone, idx) => {
              const active = idx === activeZoneIdx;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setActiveZoneIdx(idx);
                    setActiveHotspotIdx(0);
                  }}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all ${
                    active
                      ? 'bg-[#361D42] text-[#F5F1FA] shadow-lg shadow-[#361D42]/20'
                      : 'border border-[#361D42]/15 bg-[#F5F1FA] text-[#361D42] hover:border-[#EE6B96]'
                  }`}
                >
                  {zone.badge}
                </button>
              );
            })}
          </div>

          {/* Mode Toggle: Interactive Split vs Transformation Video */}
          <div className="inline-flex rounded-full border border-[#361D42]/15 bg-[#F5F1FA] p-1">
            <button
              type="button"
              onClick={() => setViewMode('compare')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                viewMode === 'compare'
                  ? 'bg-[#EE6B96] text-white shadow-sm'
                  : 'text-[#361D42]/75 hover:text-[#361D42]'
              }`}
            >
              <Layers size={14} />
              Comparador Antes / Después
            </button>
            <button
              type="button"
              onClick={() => setViewMode('video')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                viewMode === 'video'
                  ? 'bg-[#EE6B96] text-white shadow-sm'
                  : 'text-[#361D42]/75 hover:text-[#361D42]'
              }`}
            >
              <Film size={14} />
              Video de Transformación
            </button>
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 8 Columns: Visual Comparator or Transformation Video */}
          <div className="lg:col-span-8">
            <div
              ref={stageRef}
              onPointerDown={(e) => {
                if (viewMode !== 'compare') return;
                isDraggingRef.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                updateSplitFromClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (viewMode !== 'compare' || !isDraggingRef.current) return;
                updateSplitFromClientX(e.clientX);
              }}
              onPointerUp={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
                isDraggingRef.current = false;
              }}
              className={`relative aspect-[4/3] w-full select-none overflow-hidden rounded-[2rem] border border-[#361D42]/15 bg-[#23112B] shadow-[0_24px_70px_rgba(54,29,66,0.18)] ${
                viewMode === 'compare' ? 'cursor-ew-resize touch-none' : ''
              }`}
            >
              {viewMode === 'compare' ? (
                <>
                  {/* Base Layer: Consolidated Architectural Vision (Right side) */}
                  <img
                    src={currentZone.visionImg}
                    alt={`${currentZone.title} — Proyección Consolidada`}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />

                  {/* Clipped Layer: Real Project Photo Today (Left side) */}
                  <img
                    src={currentZone.realImg}
                    alt={`${currentZone.title} — Estado Real en Obra`}
                    style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />

                  {/* Interactive Technical Pins on the Stage */}
                  {currentZone.hotspots.map((spot, idx) => {
                    const isSelected = activeHotspotIdx === idx;
                    return (
                      <button
                        key={spot.title}
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setActiveHotspotIdx(idx)}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      >
                        <span className="relative flex h-8 w-8 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EE6B96] opacity-60" />
                          <span
                            className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold shadow-lg transition-transform group-hover:scale-110 ${
                              isSelected ? 'bg-[#EE6B96] text-white scale-110' : 'bg-[#361D42] text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </span>
                      </button>
                    );
                  })}

                  {/* Vertical Divider Line & Handle */}
                  <div
                    style={{ left: `${splitPercent}%` }}
                    className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                  >
                    <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#EE6B96] text-white shadow-xl">
                      <MoveHorizontal size={20} />
                    </div>
                  </div>

                  {/* Corner Badges */}
                  <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-[#361D42]/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F1FA] backdrop-blur-md">
                    Foto Real en Obra Hoy
                  </div>
                  <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-[#EE6B96]/40 bg-[#23112B]/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F48FB1] backdrop-blur-md">
                    Proyección Arquitectónica
                  </div>
                </>
              ) : (
                <div className="relative h-full w-full">
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
                  <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-[#EE6B96]/40 bg-[#23112B]/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F1FA] backdrop-blur-md">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#EE6B96]" />
                    Secuencia de Transformación Arquitectónica
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Columns: Technical Specs & Active Inspection Card */}
          <div className="flex flex-col justify-between rounded-[2rem] border border-[#361D42]/12 bg-[#F5F1FA] p-6 sm:p-8 lg:col-span-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#515B1B]">
                {currentZone.badge}
              </span>
              <h3 className="mt-2 font-display text-3xl leading-tight text-[#361D42]">
                {currentZone.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#361D42]/75">
                {currentZone.subtitle}
              </p>

              {/* Key Metrics List */}
              <div className="mt-6 space-y-2.5">
                {currentZone.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between rounded-2xl border border-[#361D42]/10 bg-[#EAE3F2]/65 px-4 py-3"
                  >
                    <span className="text-xs font-medium text-[#361D42]/70">{m.label}</span>
                    <span className="text-xs font-bold text-[#361D42]">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Hotspot Inspector */}
              <div className="mt-6">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#361D42]/60">
                  Puntos Verificados en Fotografía Real:
                </p>
                <div className="space-y-2">
                  {currentZone.hotspots.map((spot, idx) => {
                    const active = activeHotspotIdx === idx;
                    return (
                      <button
                        key={spot.title}
                        type="button"
                        onClick={() => {
                          setViewMode('compare');
                          setActiveHotspotIdx(idx);
                        }}
                        className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                          active
                            ? 'border-[#EE6B96] bg-[#361D42] text-[#F5F1FA] shadow-md'
                            : 'border-[#361D42]/10 bg-white/80 text-[#361D42] hover:border-[#361D42]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              active ? 'bg-[#EE6B96] text-white' : 'bg-[#EAE3F2] text-[#361D42]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold">{spot.title}</span>
                        </div>
                        <p
                          className={`mt-1 pl-7 text-xs leading-relaxed ${
                            active ? 'text-[#EAE3F2]/85' : 'text-[#361D42]/70'
                          }`}
                        >
                          {spot.detail}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-[#515B1B]/12 px-4 py-3 text-xs font-medium text-[#515B1B]">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Registro fotográfico oficial verificado en campo.</span>
            </div>
          </div>
        </div>

        {/* Real Project Field Photo Gallery (All 6 Drive 2D Photos) */}
        <div className="mt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#515B1B]">
                Galería de Avance Físico en Terreno
              </span>
              <h3 className="mt-1 font-display text-3xl text-[#361D42] sm:text-4xl">
                Inspección real de vías, pórtico y servicios
              </h3>
            </div>
            <span className="text-xs font-medium text-[#361D42]/70">
              Haz clic en cualquier fotografía para ampliar en alta resolución
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_GALLERY.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxItem(item)}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#361D42]/12 bg-[#F5F1FA] text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#361D42]">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#23112B]/75 via-transparent to-transparent opacity-80" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#361D42]/90 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5F1FA] backdrop-blur-md">
                    {item.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#361D42] opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    <Eye size={16} />
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EE6B96]">
                    <MapPin size={13} />
                    <span>Flamingo Residencial · Obra Real</span>
                  </div>
                  <h4 className="mt-1 font-display text-2xl text-[#361D42]">{item.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#361D42]/75">{item.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[#23112B]/90 p-4 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#23112B] text-[#F5F1FA] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-[#EE6B96]"
              aria-label="Cerrar vista ampliada"
            >
              <X size={18} />
            </button>
            <div className="aspect-[4/3] max-h-[74vh] w-full bg-black">
              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EE6B96]">
                  {lightboxItem.tag}
                </span>
                <h4 className="font-display text-2xl text-white">{lightboxItem.title}</h4>
                <p className="text-xs text-[#EAE3F2]/80">{lightboxItem.caption}</p>
              </div>
              <a
                href="#reserva-preventa"
                onClick={() => setLightboxItem(null)}
                className="rounded-full bg-[#EE6B96] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#F48FB1]"
              >
                Agendar Visita al Terreno
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
