import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Droplets,
  FileCheck2,
  Layers,
  Lightbulb,
  MapPin,
  Maximize2,
  MessageCircle,
  Rotate3D,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import {
  buildFlamingoWhatsAppUrl,
  FLAMINGO_BRAND,
  URBAN_SERVICES,
  WHATSAPP_ADVISORS,
} from '../config/flamingo';
import { type FlamingoHouseModel, HOUSE_MODELS } from '../data/flamingoData';
import { CanvasScrollSequence } from './CanvasScrollSequence';
import { HouseModelDetailModal } from './HouseModal';
import { Panorama360Viewer } from './Panorama360Viewer';

gsap.registerPlugin(ScrollTrigger);

interface InteractiveLotItem {
  id: string;
  code: string;
  block: string;
  areaSqm: 160 | 200;
  frontM: number;
  depthM: number;
  status: 'available' | 'reserved' | 'sold';
  locationType: 'Esquina frente a parque' | 'Avenida Principal' | 'Frente a Calle';
  points: string;
  center: { x: number; y: number };
}

const FEATURED_LOTS: InteractiveLotItem[] = [
  {
    id: 'lot-a1',
    code: 'Mz A · Lote 01',
    block: 'Manzana A',
    areaSqm: 200,
    frontM: 10,
    depthM: 20,
    status: 'available',
    locationType: 'Esquina frente a parque',
    points: '540,582 615,568 688,595 612,612',
    center: { x: 614, y: 589 },
  },
  {
    id: 'lot-a2',
    code: 'Mz A · Lote 02',
    block: 'Manzana A',
    areaSqm: 160,
    frontM: 8,
    depthM: 20,
    status: 'available',
    locationType: 'Avenida Principal',
    points: '618,567 692,553 764,579 690,594',
    center: { x: 691, y: 573 },
  },
  {
    id: 'lot-a3',
    code: 'Mz A · Lote 03',
    block: 'Manzana A',
    areaSqm: 160,
    frontM: 8,
    depthM: 20,
    status: 'reserved',
    locationType: 'Avenida Principal',
    points: '695,552 768,538 838,563 766,578',
    center: { x: 767, y: 558 },
  },
  {
    id: 'lot-b1',
    code: 'Mz B · Lote 01',
    block: 'Manzana B',
    areaSqm: 200,
    frontM: 10,
    depthM: 20,
    status: 'available',
    locationType: 'Esquina frente a parque',
    points: '692,632 782,612 868,642 778,664',
    center: { x: 780, y: 638 },
  },
  {
    id: 'lot-b2',
    code: 'Mz B · Lote 02',
    block: 'Manzana B',
    areaSqm: 160,
    frontM: 8,
    depthM: 20,
    status: 'available',
    locationType: 'Frente a Calle',
    points: '785,611 872,592 956,620 870,641',
    center: { x: 871, y: 616 },
  },
  {
    id: 'lot-b3',
    code: 'Mz B · Lote 03',
    block: 'Manzana B',
    areaSqm: 200,
    frontM: 10,
    depthM: 20,
    status: 'available',
    locationType: 'Avenida Principal',
    points: '875,591 962,572 1045,598 958,619',
    center: { x: 960, y: 595 },
  },
  {
    id: 'lot-c1',
    code: 'Mz C · Lote 01',
    block: 'Manzana C',
    areaSqm: 160,
    frontM: 8,
    depthM: 20,
    status: 'available',
    locationType: 'Frente a Calle',
    points: '995,562 1098,542 1192,568 1088,590',
    center: { x: 1093, y: 565 },
  },
  {
    id: 'lot-c2',
    code: 'Mz C · Lote 02',
    block: 'Manzana C',
    areaSqm: 200,
    frontM: 10,
    depthM: 20,
    status: 'available',
    locationType: 'Esquina frente a parque',
    points: '1102,541 1205,522 1298,548 1195,567',
    center: { x: 1200, y: 544 },
  },
];

export const HomeExperience: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);

  const [lotFilterArea, setLotFilterArea] = useState<'all' | 160 | 200>('all');
  const [selectedLot, setSelectedLot] = useState<InteractiveLotItem>(FEATURED_LOTS[0]);
  const [selectedModel, setSelectedModel] = useState<FlamingoHouseModel | null>(null);
  const [activePanoRoomIdx, setActivePanoRoomIdx] = useState<number>(0);
  const [fullscreen360Open, setFullscreen360Open] = useState<boolean>(false);

  // Lead form state for instant WhatsApp reservation
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadAreaPref, setLeadAreaPref] = useState<'160 m²' | '200 m²'>('160 m²');

  // =========================================================================
  // 1. SUAVIZADO DE INERCIA (LENIS) + GSAP SCROLLTRIGGER + CURSOR EDITORIAL
  // =========================================================================
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-editorial-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, rootRef);

    // Custom Flamingo Pink Cursor Follower on desktop
    const dotX = cursorDotRef.current
      ? gsap.quickTo(cursorDotRef.current, 'x', { duration: 0.25, ease: 'power3.out' })
      : null;
    const dotY = cursorDotRef.current
      ? gsap.quickTo(cursorDotRef.current, 'y', { duration: 0.25, ease: 'power3.out' })
      : null;

    const handleMouseMove = (e: MouseEvent) => {
      dotX?.(e.clientX);
      dotY?.(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const filteredLots = FEATURED_LOTS.filter((lot) =>
    lotFilterArea === 'all' ? true : lot.areaSqm === lotFilterArea
  );

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hola Flamingo Residencial, mi nombre es ${
      leadName || 'Interesado'
    } (${leadPhone || 'sin teléfono'}). Deseo información de la PREVENTA para un lote de ${leadAreaPref} con título de propiedad y entrega inmediata (a 30m del Colegio Virgen Dolorosa).`;
    window.open(buildFlamingoWhatsAppUrl(0, msg), '_blank', 'noopener,noreferrer');
  };

  const defaultRooms = HOUSE_MODELS[0].rooms360;
  const activeRoom = defaultRooms[activePanoRoomIdx] || defaultRooms[0];

  return (
    <div
      id="top"
      ref={rootRef}
      className="relative w-full min-h-screen bg-[#EAE3F2] text-[#361D42] font-dm overflow-x-hidden"
    >
      {/* Cursor Editorial Rosa Flamenco (#EE6B96) en Desktop */}
      <div
        ref={cursorDotRef}
        className="hidden lg:block fixed top-0 left-0 w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-[#EE6B96] bg-[#EE6B96]/15 pointer-events-none z-[90] mix-blend-multiply"
        aria-hidden="true"
      />

      {/* =====================================================================
          SECCIÓN 1: MOTOR <CanvasScrollSequence /> (450vh Pinned + 150 Frames)
         ===================================================================== */}
      <CanvasScrollSequence
        onOpen360={() => handleScrollToSection('recorrido-360')}
        onScrollToLots={() => handleScrollToSection('plano-lotes')}
      />

      {/* =====================================================================
          SECCIÓN 2: MANIFIESTO EDITORIAL EN VERDE OLIVA ORGÁNICO (#515B1B)
          (Inspirado directamente en docs/brand/tipografia-marca.png)
         ===================================================================== */}
      <section className="relative py-20 sm:py-28 px-6 sm:px-12 lg:px-20 bg-[#515B1B] text-[#F5F1FA]">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end gsap-editorial-reveal">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5F1FA]/40 text-xs uppercase tracking-[0.26em] font-dm">
                <span>URBANISMO ORGÁNICO · INVERSIÓN SEGURA</span>
              </div>
              <h2 className="font-geista font-normal text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-wide uppercase text-white">
                Naturaleza, <span className="italic text-[#F48FB1]">conectividad</span> y entrega
                inmediata
              </h2>
            </div>
            <div className="lg:col-span-5 space-y-4 font-dm text-sm sm:text-base text-[#F5F1FA]/90 leading-relaxed">
              <p>
                <strong>Flamingo Residencial</strong> nace sobre un valle privilegiado a solo{' '}
                <strong>30 metros del Colegio Virgen Dolorosa</strong>, combinando la serenidad de
                la naturaleza con habilitación urbana completa de{' '}
                <strong>agua, desagüe y alumbrado público</strong>.
              </p>
              <div className="h-px w-full bg-[#F5F1FA]/25" />
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#F48FB1] font-bold">
                Lotes de 160 m² y 200 m² · Con Título de Propiedad
              </p>
            </div>
          </div>

          {/* 4 Pilares de Valor de Preventa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gsap-editorial-reveal">
            <div className="rounded-3xl bg-[#23112B]/35 border border-[#F5F1FA]/20 p-7 space-y-3 backdrop-blur-sm">
              <span className="font-geista text-4xl sm:text-5xl text-[#F48FB1] block">
                160 & 200 m²
              </span>
              <h3 className="font-dm font-bold text-base uppercase tracking-wider text-white">
                Metrajes Residenciales
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F1FA]/80 leading-relaxed">
                Lotes amplios de frente generoso ideales para vivienda familiar con jardín, terraza
                o proyecto de alta rentabilidad.
              </p>
            </div>

            <div className="rounded-3xl bg-[#23112B]/35 border border-[#F5F1FA]/20 p-7 space-y-3 backdrop-blur-sm">
              <span className="font-geista text-4xl sm:text-5xl text-white block">100%</span>
              <h3 className="font-dm font-bold text-base uppercase tracking-wider text-white">
                Título de Propiedad
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F1FA]/80 leading-relaxed">
                Seguridad jurídica garantizada y documentación lista para transferencia y{' '}
                <strong>entrega inmediata</strong>.
              </p>
            </div>

            <div className="rounded-3xl bg-[#23112B]/35 border border-[#F5F1FA]/20 p-7 space-y-3 backdrop-blur-sm">
              <span className="font-geista text-4xl sm:text-5xl text-[#F48FB1] block">3 / 3</span>
              <h3 className="font-dm font-bold text-base uppercase tracking-wider text-white">
                Servicios Completos
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F1FA]/80 leading-relaxed">
                Habilitación integral con redes de <strong>Agua</strong>, <strong>Desagüe</strong> y{' '}
                <strong>Alumbrado Público LED</strong>.
              </p>
            </div>

            <div className="rounded-3xl bg-[#23112B]/35 border border-[#F5F1FA]/20 p-7 space-y-3 backdrop-blur-sm">
              <span className="font-geista text-4xl sm:text-5xl text-white block">30 m</span>
              <h3 className="font-dm font-bold text-base uppercase tracking-wider text-white">
                Colegio Virgen Dolorosa
              </h3>
              <p className="text-xs sm:text-sm text-[#F5F1FA]/80 leading-relaxed">
                Ubicación consolidada a pasos del Colegio Virgen Dolorosa y con acceso directo por
                vía principal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 3: PLANO INTERACTIVO DE LOTES (160 m² y 200 m²)
         ===================================================================== */}
      <section
        id="plano-lotes"
        className="relative py-20 sm:py-28 px-6 sm:px-12 lg:px-20 bg-[#EAE3F2] text-[#361D42]"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6 gsap-editorial-reveal">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#361D42] text-xs font-dm font-medium uppercase tracking-[0.24em]">
                <Layers size={13} className="text-[#EE6B96]" />
                <span>SELECCIÓN INTERACTIVA DE LOTES</span>
              </span>
              <h2 className="font-geista text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wide text-[#361D42]">
                Plano Interactivo de Preventa
              </h2>
            </div>

            {/* Filtros por metraje oficial (160 m² / 200 m²) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { label: 'Todos los Lotes', value: 'all' as const },
                { label: 'Lotes 160 m²', value: 160 as const },
                { label: 'Lotes 200 m²', value: 200 as const },
              ].map((btn) => (
                <button
                  key={String(btn.value)}
                  type="button"
                  onClick={() => {
                    setLotFilterArea(btn.value);
                    const firstMatch = FEATURED_LOTS.find((l) =>
                      btn.value === 'all' ? true : l.areaSqm === btn.value
                    );
                    if (firstMatch) setSelectedLot(firstMatch);
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-dm font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    lotFilterArea === btn.value
                      ? 'bg-[#361D42] text-[#F5F1FA] border-[#361D42] shadow-lg'
                      : 'bg-[#F5F1FA] text-[#361D42] border-[#361D42]/30 hover:border-[#361D42]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <a
                href="/showroom?step=lots"
                className="px-5 py-2.5 rounded-full bg-[#EE6B96] hover:bg-[#361D42] text-white text-xs sm:text-sm font-dm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Visor Masterplan Completo</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {/* Grid: Visor Aéreo con Polígonos Interactivos + Ficha Técnica de Reserva */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch gsap-editorial-reveal">
            {/* Visor Aéreo SVG de Lotes (8 columnas) */}
            <div className="lg:col-span-8 w-full min-w-0 relative rounded-3xl overflow-hidden border-2 border-[#361D42]/20 shadow-2xl bg-[#23112B] min-h-[360px] sm:min-h-[480px]">
              <img
                src="/flow-frames/stage-75.jpg"
                alt="Vista aérea consolidada de Flamingo Residencial"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23112B]/75 via-transparent to-[#23112B]/25 pointer-events-none" />

              {/* Polígonos Interactivos SVG sobre la Lotización */}
              <svg
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
              >
                {/* Contorno general de la urbanización */}
                <polygon
                  points="422,592 1035,484 1438,538 1228,748 764,658"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeDasharray="12 8"
                  opacity="0.75"
                />

                {filteredLots.map((lot) => {
                  const isSelected = selectedLot.id === lot.id;
                  const fillColor =
                    lot.status === 'available'
                      ? isSelected
                        ? 'rgba(238, 107, 150, 0.68)'
                        : 'rgba(16, 185, 129, 0.42)'
                      : 'rgba(245, 158, 11, 0.48)';

                  return (
                    <g
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className="cursor-pointer group"
                    >
                      <polygon
                        points={lot.points}
                        fill={fillColor}
                        stroke={isSelected ? '#FFFFFF' : '#F5F1FA'}
                        strokeWidth={isSelected ? '4' : '2.2'}
                        className="transition-all duration-200 hover:fill-[#EE6B96]/65"
                      />
                      <circle
                        cx={lot.center.x}
                        cy={lot.center.y}
                        r={isSelected ? 16 : 12}
                        fill={isSelected ? '#361D42' : '#F5F1FA'}
                        stroke="#EE6B96"
                        strokeWidth="3"
                      />
                      <text
                        x={lot.center.x}
                        y={lot.center.y + 4}
                        textAnchor="middle"
                        fill={isSelected ? '#F5F1FA' : '#361D42'}
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="DM Sans, sans-serif"
                      >
                        {lot.areaSqm}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Leyenda Flotante */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#23112B]/85 backdrop-blur-md border border-[#F48FB1]/25 text-[#F5F1FA] text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    Disponible Entrega Inmediata
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    Reservado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EE6B96] inline-block" />
                    Seleccionado
                  </span>
                </div>
                <span className="text-[#F48FB1] font-medium">
                  Haz clic en cualquier lote para cotizar
                </span>
              </div>
            </div>

            {/* Tarjeta de Detalle del Lote Seleccionado (4 columnas) */}
            <div className="lg:col-span-4 w-full min-w-0 relative z-10 rounded-3xl bg-[#361D42] text-[#F5F1FA] p-7 sm:p-8 flex flex-col justify-between shadow-2xl border border-[#F48FB1]/30">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-[#EE6B96]/25 border border-[#EE6B96]/50 text-[#F48FB1] text-xs font-dm font-bold uppercase tracking-wider">
                    {selectedLot.block}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedLot.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    }`}
                  >
                    {selectedLot.status === 'available' ? 'Disponible' : 'Reservado'}
                  </span>
                </div>

                <div>
                  <h3 className="font-geista text-3xl sm:text-4xl text-white uppercase tracking-wide">
                    {selectedLot.code}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#EAE3F2]/80 mt-1">
                    {selectedLot.locationType} · A 30m del Colegio Virgen Dolorosa
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-[#23112B]/70 border border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-[#F48FB1] block">
                      Área Total
                    </span>
                    <span className="font-geista text-3xl text-white tabular-nums">
                      {selectedLot.areaSqm} m²
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#23112B]/70 border border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-[#F48FB1] block">
                      Dimensiones
                    </span>
                    <span className="font-geista text-2xl text-white tabular-nums">
                      {selectedLot.frontM}m × {selectedLot.depthM}m
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-[#EAE3F2]/90 pt-1">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#EE6B96] shrink-0" />
                    <span>Con Título de Propiedad · ¡Entrega Inmediata!</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#EE6B96] shrink-0" />
                    <span>Servicios de Agua, Desagüe y Alumbrado Público</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#EE6B96] shrink-0" />
                    <span>A solo 30 metros del Colegio Virgen Dolorosa</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 pt-6">
                <a
                  href={buildFlamingoWhatsAppUrl(
                    0,
                    `Hola Flamingo Residencial, me interesa reservar el ${selectedLot.code} de ${selectedLot.areaSqm} m² (${selectedLot.frontM}m x ${selectedLot.depthM}m) en PREVENTA con entrega inmediata.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] font-dm font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all"
                >
                  <MessageCircle size={17} />
                  <span>Reservar {selectedLot.code} · 940 152 191</span>
                </a>

                <a
                  href={buildFlamingoWhatsAppUrl(
                    1,
                    `Hola Flamingo Residencial, deseo agendar una visita para ver el ${selectedLot.code} de ${selectedLot.areaSqm} m².`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-dm font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle size={15} />
                  <span>Consultar con Asesor 2 · 942 710 250</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 4: RECORRIDO VIRTUAL 360° EMBEBIDO & PROYECCIÓN RESIDENCIAL
         ===================================================================== */}
      <section
        id="recorrido-360"
        className="relative py-20 sm:py-28 px-6 sm:px-12 lg:px-20 bg-[#F5F1FA] text-[#361D42]"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-6 gsap-editorial-reveal">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#361D42] text-xs font-dm font-medium uppercase tracking-[0.24em]">
                <Rotate3D size={14} className="text-[#EE6B96]" />
                <span>EXPERIENCIA INMERSIVA EQUIRECTANGULAR</span>
              </span>
              <h2 className="font-geista text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wide text-[#361D42]">
                Recorrido Virtual 360°
              </h2>
              <p className="text-sm sm:text-base text-[#361D42]/80 font-dm">
                Explora la proyección arquitectónica en 360° de las viviendas que puedes construir
                en tu lote de <strong>160 m²</strong> o <strong>200 m²</strong> en Flamingo
                Residencial, o ingresa al Showroom Aéreo 360° a pantalla completa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {defaultRooms.map((room, idx) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActivePanoRoomIdx(idx)}
                  className={`px-4 py-2.5 rounded-full text-xs font-dm font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    activePanoRoomIdx === idx
                      ? 'bg-[#361D42] text-[#F5F1FA] border-[#361D42]'
                      : 'bg-white text-[#361D42] border-[#361D42]/25 hover:border-[#361D42]'
                  }`}
                >
                  {room.name}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setFullscreen360Open(true)}
                className="px-4 py-2.5 rounded-full bg-[#EE6B96] text-white text-xs font-dm font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Maximize2 size={14} />
                <span>Expandir 360°</span>
              </button>
            </div>
          </div>

          {/* Contenedor Embebido del Visor 360° */}
          <div className="relative w-full h-[420px] sm:h-[520px] rounded-3xl overflow-hidden border-2 border-[#361D42]/20 shadow-2xl bg-[#23112B] gsap-editorial-reveal">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-cover bg-center" style={{ backgroundImage: `url('/flow-frames/last-frame.jpg')` }}>
              <div className="absolute inset-0 bg-[#23112B]/70 backdrop-blur-[2px]" />
              <div className="relative z-10 max-w-xl space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#EE6B96]/25 border-2 border-[#EE6B96] flex items-center justify-center mx-auto text-[#F48FB1]">
                  <Rotate3D size={32} />
                </div>
                <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-[#F48FB1] text-xs font-dm uppercase tracking-[0.2em]">
                  Ambiente Seleccionado: {activeRoom.name}
                </span>
                <h3 className="font-geista text-3xl sm:text-5xl text-white uppercase">
                  Explora en 360° Interactivo
                </h3>
                <p className="text-xs sm:text-sm text-[#EAE3F2]/85 leading-relaxed">
                  Gira la cámara en 360 grados con WebGL o abre el Showroom Aéreo completo con
                  comparador Día / Noche y los 4 modelos arquitectónicos.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFullscreen360Open(true)}
                    className="px-7 py-3.5 rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] font-dm font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Rotate3D size={17} />
                    <span>Iniciar Visor 360° Aquí</span>
                  </button>
                  <a
                    href="/showroom?step=intro"
                    className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-dm font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    <Compass size={17} />
                    <span>Ir al Showroom Aéreo Completo</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de los 4 Modelos de Casa proyectados para lotes de 160m² y 200m² */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gsap-editorial-reveal">
            {HOUSE_MODELS.map((model) => (
              <div
                key={model.id}
                className="group rounded-3xl overflow-hidden bg-white border border-[#361D42]/15 hover:border-[#EE6B96] shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-[#361D42]">
                    <img
                      src={model.exteriors.frontal}
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#361D42]/90 text-[#F5F1FA] text-[10px] font-dm font-bold uppercase tracking-wider">
                      {model.badge}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-dm font-bold uppercase tracking-widest text-[#EE6B96]">
                      {model.builtAreaSqm} m² Techados · Compatible 160/200 m²
                    </span>
                    <h3 className="font-geista text-2xl text-[#361D42] uppercase">{model.name}</h3>
                    <p className="text-xs text-[#361D42]/75 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedModel(model)}
                    className="w-full py-2.5 rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white text-xs font-dm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Rotate3D size={14} />
                    <span>Ver Planos & Tour 360°</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN 5: CIERRE COMERCIAL DE RESERVA EN PREVENTA & WHATSAPP OFICIAL
         ===================================================================== */}
      <section
        id="reserva-preventa"
        className="relative py-20 sm:py-28 px-6 sm:px-12 lg:px-20 bg-[#361D42] text-[#F5F1FA] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center gsap-editorial-reveal">
          {/* Columna Izquierda: Identidad de Marca & Respaldo */}
          <div className="lg:col-span-7 space-y-6">
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-24 sm:h-28 w-auto object-contain"
            />

            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#F48FB1]/50 text-[#F48FB1] text-xs font-dm font-bold uppercase tracking-[0.26em]">
              <Sparkles size={13} />
              <span>APROVECHA LA PREVENTA</span>
            </div>

            <h2 className="font-geista font-normal text-4xl sm:text-6xl lg:text-7xl uppercase leading-[1.02] text-white">
              Asegura hoy tu lote de{' '}
              <span className="text-[#F48FB1]">160 m² o 200 m²</span>
            </h2>

            <p className="text-base sm:text-lg text-[#EAE3F2]/90 max-w-2xl leading-relaxed">
              Con <strong>título de propiedad</strong> y <strong>¡Entrega Inmediata!</strong> Todos
              los servicios básicos completos (<strong>Agua, Desagüe y Alumbrado Público</strong>) a
              solo <strong>30 metros del Colegio Virgen Dolorosa</strong>.
            </p>

            {/* Botones Cápsula Oficiales de WhatsApp (940 152 191 y 942 710 250) */}
            <div className="pt-2 space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#F48FB1] font-bold">
                Atención Directa por WhatsApp · Central de Preventa
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {WHATSAPP_ADVISORS.map((adv, idx) => (
                  <a
                    key={adv.id}
                    href={buildFlamingoWhatsAppUrl(idx as 0 | 1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-7 py-4 rounded-full bg-[#EAE3F2] hover:bg-[#EE6B96] text-[#361D42] hover:text-white font-dm text-base sm:text-lg font-bold tracking-[0.14em] border-2 border-[#EAE3F2] transition-all duration-300 shadow-xl hover:scale-105"
                  >
                    <MessageCircle size={20} className="text-[#EE6B96] group-hover:text-white" />
                    <span className="tabular-nums">{adv.displayPhone}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario Rápido de Reserva en Preventa */}
          <div className="lg:col-span-5 rounded-3xl bg-[#23112B] border border-[#F48FB1]/30 p-7 sm:p-9 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-dm uppercase tracking-[0.2em] text-[#EE6B96] font-bold">
                Ficha de Cotización Inmediata
              </span>
              <h3 className="font-geista text-3xl text-white uppercase">
                Solicita el Plano y Precios de Preventa
              </h3>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="lead-name"
                  className="block text-xs uppercase tracking-wider text-[#EAE3F2]/80 mb-1.5"
                >
                  Nombre Completo
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-4 py-3 rounded-xl bg-[#361D42] border border-[#F48FB1]/30 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#EE6B96]"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-phone"
                  className="block text-xs uppercase tracking-wider text-[#EAE3F2]/80 mb-1.5"
                >
                  WhatsApp / Celular
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="Ej. 940 152 191"
                  className="w-full px-4 py-3 rounded-xl bg-[#361D42] border border-[#F48FB1]/30 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#EE6B96]"
                />
              </div>

              <div>
                <span className="block text-xs uppercase tracking-wider text-[#EAE3F2]/80 mb-1.5">
                  Metraje de Interés
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['160 m²', '200 m²'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLeadAreaPref(size)}
                      className={`py-3 rounded-xl font-dm font-bold text-sm border transition-all cursor-pointer ${
                        leadAreaPref === size
                          ? 'bg-[#EE6B96] text-[#23112B] border-[#EE6B96]'
                          : 'bg-[#361D42] text-white border-white/15 hover:border-[#F48FB1]'
                      }`}
                    >
                      Lote de {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] font-dm font-bold text-sm uppercase tracking-[0.18em] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                <span>Enviar Solicitud a WhatsApp</span>
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#EAE3F2]/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#EE6B96]" />
                Título de propiedad
              </span>
              <span>¡Entrega Inmediata!</span>
            </div>
          </div>
        </div>

        {/* Footer Editorial Minimalista */}
        <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#EAE3F2]/70">
          <p>
            © {new Date().getFullYear()} <strong>Flamingo Residencial</strong> · Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} className="text-[#EE6B96]" />
            <span>A solo 30 metros del Colegio Virgen Dolorosa</span>
          </p>
        </footer>
      </section>

      {/* Modal de Modelos de Casa & Planos */}
      {selectedModel && (
        <HouseModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onSelectModel={(id) =>
            setSelectedModel(HOUSE_MODELS.find((m) => m.id === id) || selectedModel)
          }
        />
      )}

      {/* Modal Fullscreen 360° */}
      {fullscreen360Open && (
        <Panorama360Viewer
          rooms={defaultRooms}
          initialRoomId={activeRoom.id}
          modelName="Flamingo Residencial · Proyección 360°"
          onClose={() => setFullscreen360Open(false)}
        />
      )}
    </div>
  );
};
