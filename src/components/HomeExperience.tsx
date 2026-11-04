import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { FLAMINGO_BRAND } from '../config/flamingo';
import {
  OFFICIAL_BLOCKS,
  OFFICIAL_LOT_COUNT,
  PLAN_HEIGHT,
  PLAN_WIDTH,
  PUBLIC_RECREATION,
} from '../data/officialPlan';
import { CanvasScrollSequence } from './CanvasScrollSequence';
import { ContactDrawer, type InterestOption } from './ContactDrawer';
import { Real360AerialViewer } from './Real360AerialViewer';
import { RealProjectShowcase } from './RealProjectShowcase';

gsap.registerPlugin(ScrollTrigger);

export const HomeExperience: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Slide-Over Contact Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInterest, setDrawerInterest] = useState<InterestOption>(
    'Lote de 160 m² (8m × 20m)'
  );
  const [drawerLotNote, setDrawerLotNote] = useState<string | undefined>(undefined);

  // Sección C: Immersive Explorer State ('360' | 'plano' | 'mapa')
  const [explorerTab, setExplorerTab] = useState<'360' | 'plano' | 'mapa'>('plano');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(OFFICIAL_BLOCKS[0]?.id || 'A');
  const [selectedLotId, setSelectedLotId] = useState<string>(
    OFFICIAL_BLOCKS[0]?.lots[0]?.id || 'A-01'
  );

  const currentBlock =
    OFFICIAL_BLOCKS.find((b) => b.id === selectedBlockId) || OFFICIAL_BLOCKS[0];
  const currentLot =
    currentBlock.lots.find((l) => l.id === selectedLotId) || currentBlock.lots[0];

  const handleOpenDrawer = (interest?: InterestOption, lotNote?: string) => {
    if (interest) {
      setDrawerInterest(interest);
    }
    setDrawerLotNote(lotNote);
    setDrawerOpen(true);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
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
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, rootRef);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const handleNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    const blk = OFFICIAL_BLOCKS.find((b) => b.id === blockId);
    if (blk && blk.lots.length > 0) {
      setSelectedLotId(blk.lots[0].id);
    }
  };

  const handleQuoteSelectedLot = () => {
    const area = currentLot?.areaSqm || 160;
    const preselectedInterest: InterestOption =
      area >= 190 ? 'Lote de 200 m² (10m × 20m)' : 'Lote de 160 m² (8m × 20m)';
    const lotNote = `Manzana ${currentBlock.letter} · Lote ${currentLot?.number || '01'}${
      currentLot?.areaSqm ? ` (${currentLot.areaSqm} m²)` : ''
    }`;
    handleOpenDrawer(preselectedInterest, lotNote);
  };

  return (
    <div
      id="top"
      ref={rootRef}
      className="relative w-full min-h-screen bg-[#F5F1FA] text-[#23112B] font-dm overflow-x-hidden"
    >
      {/* =====================================================================
          HERO & PINNED 150-FRAME SEQUENCE CON MÁSCARA EXACTA DE ALA DE FLAMENCO
         ===================================================================== */}
      <CanvasScrollSequence
        onNavigate={handleNavigate}
        onOpenContactDrawer={handleOpenDrawer}
      />

      {/* =====================================================================
          SECCIÓN A (SHOWCASE CINEMÁTICO CON NARRACIÓN) &
          SECCIÓN B (ABANICO INTERACTIVO DE LOTES 160/200m² + WIDGET DE OBRA)
         ===================================================================== */}
      <RealProjectShowcase onOpenContactDrawer={handleOpenDrawer} />

      {/* =====================================================================
          SECCIÓN C: EXPLORADOR INMERSIVO (PLANO 68 LOTES / VISTA 360° / GPS)
          + TARJETA HORIZONTAL DE CIERRE EN CIRUELA PROFUNDO (#2B1436)
         ===================================================================== */}
      <section
        id="explorador-360"
        className="bg-[#F5F1FA] pt-16 pb-24 px-4 sm:px-10 lg:px-16 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Explorer Container (Rounded-[36px]) */}
          <div
            style={{ border: '1px solid rgba(54, 29, 66, 0.08)' }}
            className="rounded-[36px] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_24px_70px_-20px_rgba(35,17,43,0.12)] space-y-7 gsap-editorial-reveal"
          >
            {/* Header + Segmented Pill Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="font-dm text-[11px] font-bold uppercase tracking-[0.22em] text-[#515B1B]">
                  EXPLORADOR INTERACTIVO DE LOTIZACIÓN
                </span>
                <h2 className="font-geista font-normal text-3xl sm:text-5xl text-[#361D42] leading-tight">
                  <span>Recorre el plano oficial y el </span>
                  <span className="italic text-[#EE6B96]">vuelo 360°</span>
                </h2>
              </div>

              {/* Tactile Segmented Pills */}
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-[#F5F1FA] p-1.5 border border-[#361D42]/10 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setExplorerTab('plano')}
                  className={`rounded-full px-4 sm:px-5 py-2.5 font-dm text-xs font-bold transition-all cursor-pointer ${
                    explorerTab === 'plano'
                      ? 'bg-[#361D42] text-white shadow-sm'
                      : 'text-[#361D42]/75 hover:text-[#361D42]'
                  }`}
                >
                  {`Plano Oficial (${OFFICIAL_LOT_COUNT} Lotes)`}
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerTab('360')}
                  className={`rounded-full px-4 sm:px-5 py-2.5 font-dm text-xs font-bold transition-all cursor-pointer ${
                    explorerTab === '360'
                      ? 'bg-[#361D42] text-white shadow-sm'
                      : 'text-[#361D42]/75 hover:text-[#361D42]'
                  }`}
                >
                  Tour Aéreo 360° (8 Vistas)
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerTab('mapa')}
                  className={`rounded-full px-4 sm:px-5 py-2.5 font-dm text-xs font-bold transition-all cursor-pointer ${
                    explorerTab === 'mapa'
                      ? 'bg-[#361D42] text-white shadow-sm'
                      : 'text-[#361D42]/75 hover:text-[#361D42]'
                  }`}
                >
                  Mapa GPS Tarapoto
                </button>
              </div>
            </div>

            {/* Tab 1: Interactive Official Plan (68 Lots A-H) */}
            {explorerTab === 'plano' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 7 Cols: Interactive Blueprint SVG */}
                <div className="lg:col-span-7 overflow-hidden rounded-[28px] bg-[#23112B] border border-[#361D42]/15 shadow-lg">
                  <div className="relative w-full aspect-[1034/1272] max-h-[640px] mx-auto">
                    <img
                      src="/urbanization/flamingo-lots-plan.webp"
                      alt="Plano Oficial de Lotes · Flamingo Residencial Tarapoto"
                      className="h-full w-full object-contain bg-[#2B1636]"
                    />
                    <svg
                      viewBox={`0 0 ${PLAN_WIDTH} ${PLAN_HEIGHT}`}
                      className="absolute inset-0 h-full w-full"
                    >
                      <path
                        d={PUBLIC_RECREATION.path}
                        fill="rgba(81, 91, 27, 0.28)"
                        stroke="#A3E635"
                        strokeWidth="2"
                      />
                      {OFFICIAL_BLOCKS.map((block) => {
                        const isBlockSelected = block.id === currentBlock.id;
                        return (
                          <g key={block.id}>
                            <path
                              d={block.path}
                              fill={
                                isBlockSelected
                                  ? 'rgba(238, 107, 150, 0.14)'
                                  : 'rgba(255, 255, 255, 0.02)'
                              }
                              stroke={isBlockSelected ? '#EE6B96' : 'rgba(255,255,255,0.35)'}
                              strokeWidth={isBlockSelected ? '3' : '1.5'}
                              onClick={() => handleSelectBlock(block.id)}
                              className="cursor-pointer transition-colors"
                            />
                            {block.lots.map((lot) => {
                              const isLotSelected = lot.id === currentLot?.id;
                              return (
                                <path
                                  key={lot.id}
                                  d={lot.path}
                                  fill={
                                    isLotSelected
                                      ? 'rgba(238, 107, 150, 0.72)'
                                      : isBlockSelected
                                        ? 'rgba(244, 143, 177, 0.22)'
                                        : 'transparent'
                                  }
                                  stroke={
                                    isLotSelected
                                      ? '#FFFFFF'
                                      : isBlockSelected
                                        ? 'rgba(255,255,255,0.55)'
                                        : 'transparent'
                                  }
                                  strokeWidth={isLotSelected ? '3' : '1.2'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBlockId(block.id);
                                    setSelectedLotId(lot.id);
                                  }}
                                  className="cursor-pointer hover:fill-[#EE6B96]/50 transition-colors"
                                />
                              );
                            })}
                            <g
                              onClick={() => handleSelectBlock(block.id)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={block.labelX}
                                cy={block.labelY}
                                r={isBlockSelected ? 22 : 18}
                                fill={isBlockSelected ? '#EE6B96' : '#361D42'}
                                stroke="#FFFFFF"
                                strokeWidth="2.5"
                              />
                              <text
                                x={block.labelX}
                                y={block.labelY + 6}
                                textAnchor="middle"
                                fill={isBlockSelected ? '#23112B' : '#FFFFFF'}
                                fontSize="18"
                                fontWeight="bold"
                              >
                                {block.letter}
                              </text>
                            </g>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Right 5 Cols: Clean Tactile Lot Picker & Direct Drawer Trigger */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  <div className="rounded-[28px] bg-[#F5F1FA] p-6 border border-[#361D42]/10 space-y-5">
                    <div className="space-y-2">
                      <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-[#515B1B]">
                        MANZANAS OFICIALES (A - H)
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {OFFICIAL_BLOCKS.map((blk) => {
                          const active = blk.id === currentBlock.id;
                          return (
                            <button
                              key={blk.id}
                              type="button"
                              onClick={() => handleSelectBlock(blk.id)}
                              className={`rounded-2xl py-2.5 px-3 font-dm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#361D42] text-white shadow-sm'
                                  : 'bg-white text-[#361D42] hover:bg-[#EAE3F2]'
                              }`}
                            >
                              {`Mz ${blk.letter}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#361D42]/10">
                      <span className="font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-[#361D42]/70">
                        {`Selecciona un lote en Manzana ${currentBlock.letter}:`}
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {currentBlock.lots.map((lot) => {
                          const active = lot.id === currentLot?.id;
                          return (
                            <button
                              key={lot.id}
                              type="button"
                              onClick={() => setSelectedLotId(lot.id)}
                              className={`rounded-xl px-3 py-1.5 font-dm text-xs font-semibold transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#EE6B96] text-[#23112B] shadow-xs'
                                  : 'bg-white text-[#361D42]/80 hover:bg-[#EAE3F2]'
                              }`}
                            >
                              {`Lote ${lot.number}${lot.areaSqm ? ` · ${lot.areaSqm}m²` : ''}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Lot Summary Card */}
                  <div className="rounded-[28px] bg-[#2B1436] text-white p-6 sm:p-7 space-y-5 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#EE6B96]/20 border border-[#EE6B96]/40 px-3.5 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.18em] text-[#F48FB1]">
                        {`MANZANA ${currentBlock.letter} · LOTE ${currentLot?.number || '01'}`}
                      </span>
                      <span className="font-dm text-xs text-white/75">Entrega Inmediata</span>
                    </div>

                    <div>
                      <p className="font-geista text-4xl text-white">
                        {currentLot?.areaSqm
                          ? `${currentLot.areaSqm} m²`
                          : '160 m² / 200 m²'}
                      </p>
                      <p className="font-dm text-xs text-[#EAE3F2]/80 mt-1">
                        Con título de propiedad independizado, agua, desagüe y alumbrado público.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuoteSelectedLot}
                      className="w-full rounded-full bg-[#EE6B96] hover:bg-white text-[#23112B] py-3.5 px-6 font-dm text-xs font-bold uppercase tracking-[0.16em] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{`Solicitar Lote ${currentBlock.letter}-${currentLot?.number || '01'}`}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Real 360° Aerial Drone Tour */}
            {explorerTab === '360' && (
              <div className="pt-1">
                <Real360AerialViewer />
              </div>
            )}

            {/* Tab 3: GPS Map Location */}
            {explorerTab === 'mapa' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
                <div className="lg:col-span-5 space-y-4 p-2">
                  <span className="inline-block rounded-full bg-[#EAE3F2] px-3.5 py-1 font-dm text-[10px] font-bold uppercase tracking-[0.18em] text-[#361D42]">
                    PROLONGACIÓN JR. CUZCO S/N · TARAPOTO
                  </span>
                  <h3 className="font-geista text-3xl sm:text-4xl text-[#361D42] leading-tight">
                    A solo 30 metros del Colegio Virgen Dolorosa
                  </h3>
                  <p className="font-dm text-sm text-[#361D42]/75 leading-relaxed">
                    Coordenadas GPS verificadas: 6°30&apos;17.2&quot;S 76°21&apos;27.3&quot;W
                    (-6.504788, -76.357580). Agenda tu visita guiada en terreno hoy mismo.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenDrawer(
                        'Visita guiada al proyecto en Tarapoto',
                        'Visita guiada · Prol. Jr. Cuzco s/n (a 30m Col. Virgen Dolorosa)'
                      )
                    }
                    className="rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white hover:text-[#23112B] px-6 py-3.5 font-dm text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer"
                  >
                    Agendar visita guiada →
                  </button>
                </div>

                <div className="lg:col-span-7 overflow-hidden rounded-[28px] border border-[#361D42]/15 aspect-[16/10] bg-[#EAE3F2]">
                  <iframe
                    title="Ubicación de Flamingo Residencial en Tarapoto"
                    src="https://www.google.com/maps?q=-6.5047877,-76.3575799&z=17&output=embed"
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              TARJETA HORIZONTAL DE CIERRE EN ALTO CONTRASTE (#2B1436, rounded-[36px])
             ===================================================================== */}
          <div className="relative overflow-hidden rounded-[36px] bg-[#2B1436] text-white p-8 sm:p-12 lg:p-16 shadow-[0_32px_80px_-20px_rgba(35,17,43,0.45)] gsap-editorial-reveal">
            {/* Subtle Ambient Radial Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#EE6B96]/20 blur-3xl"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 border border-white/15 px-4 py-1.5">
                  <img
                    src={FLAMINGO_BRAND.logos.icon}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                  <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-[#F48FB1]">
                    PREVENTA EXCLUSIVA · ENTREGA INMEDIATA
                  </span>
                </div>
                <h2 className="font-geista font-normal text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.06]">
                  Tu terreno propio en Tarapoto, listo para construir hoy
                </h2>
                <p className="font-dm text-sm sm:text-base text-[#EAE3F2]/80">
                  Lotes de 160 m² y 200 m² con título de propiedad independizado en Prolongación
                  Jr. Cuzco s/n, a 30 metros del Colegio Virgen Dolorosa.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  data-testid="closing-drawer-btn"
                  onClick={() => handleOpenDrawer('Lote de 160 m² (8m × 20m)')}
                  className="group inline-flex items-center gap-4 rounded-full bg-[#EE6B96] hover:bg-white text-[#23112B] px-8 py-4 sm:py-5 font-dm text-xs sm:text-sm font-bold uppercase tracking-[0.16em] shadow-[0_16px_40px_rgba(238,107,150,0.4)] transition-all duration-300 cursor-pointer active:scale-95"
                >
                  <span>Separar mi lote en preventa</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#23112B] text-white group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Minimalist Single-Bar Footer */}
          <footer className="pt-4 border-t border-[#361D42]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-dm text-[#361D42]/75">
            <div className="flex items-center gap-3">
              <img
                src={FLAMINGO_BRAND.logos.darkText}
                alt="Flamingo Residencial"
                className="h-10 w-auto object-contain"
              />
              <span>
                © {new Date().getFullYear()} {FLAMINGO_BRAND.name} · Tarapoto, San Martín
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:+${FLAMINGO_BRAND.contact.phoneRaw}`}
                className="font-semibold text-[#361D42] hover:text-[#EE6B96] transition-colors"
              >
                {FLAMINGO_BRAND.contact.phoneDisplay}
              </a>
              <span>·</span>
              <a
                href={`mailto:${FLAMINGO_BRAND.contact.email}`}
                className="hover:text-[#EE6B96] transition-colors"
              >
                {FLAMINGO_BRAND.contact.email}
              </a>
              <span>·</span>
              <a
                href={FLAMINGO_BRAND.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE6B96] transition-colors"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href={FLAMINGO_BRAND.contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE6B96] transition-colors"
              >
                Facebook
              </a>
              <span>·</span>
              <a
                href={FLAMINGO_BRAND.logos.icon}
                download="flamingo-icon-sin-fondo.png"
                className="rounded-full bg-[#EAE3F2] hover:bg-[#361D42] text-[#361D42] hover:text-white px-3.5 py-1.5 font-bold transition-colors"
              >
                Descargar Ícono PNG (Sin Fondo)
              </a>
            </div>
          </footer>
        </div>
      </section>

      {/* =====================================================================
          SLIDE-OVER CONTACT DRAWER LATERAL DERECHO (CONVERSIÓN SIN FRICCIÓN)
         ===================================================================== */}
      <ContactDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialInterest={drawerInterest}
        selectedLotNote={drawerLotNote}
      />
    </div>
  );
};
