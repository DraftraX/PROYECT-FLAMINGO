import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  buildFlamingoWhatsAppUrl,
  FLAMINGO_BRAND,
  SELVA_PROFUNDA_CARDS,
  WHATSAPP_ADVISORS,
} from '../config/flamingo';
import {
  OFFICIAL_BLOCKS,
  OFFICIAL_LOT_COUNT,
  PLAN_HEIGHT,
  PLAN_WIDTH,
  PUBLIC_RECREATION,
} from '../data/officialPlan';
import { CanvasScrollSequence } from './CanvasScrollSequence';
import { Real360AerialViewer } from './Real360AerialViewer';
import { RealProjectShowcase } from './RealProjectShowcase';

gsap.registerPlugin(ScrollTrigger);

const BIODIVERSITY_GALLERY = [
  {
    src: '/tarapoto/cordillera-escalera-bosque.webp',
    tag: 'MONTAÑA Y CLIMA',
    title: 'ACR Cordillera Escalera',
    subtitle: 'Bosques nubosos protegidos que brindan aire puro y nacientes de agua a Tarapoto.',
  },
  {
    src: '/tarapoto/catarata-ahuashiyacu.webp',
    tag: 'TURISMO ICÓNICO',
    title: 'Catarata de Ahuashiyacu',
    subtitle: 'Caída de agua cristalina en la ruta escénica de la Cordillera Escalera.',
  },
  {
    src: '/tarapoto/fauna-gallito-rocas.webp',
    tag: 'FAUNA EMBLEMÁTICA',
    title: 'Gallito de las Rocas',
    subtitle: 'Rupicola peruvianus, ave nacional que habita los bosques montanos de San Martín.',
  },
  {
    src: '/tarapoto/fauna-mariposa-cordillera.webp',
    tag: 'BIODIVERSIDAD',
    title: 'Mariposas de Cordillera Escalera',
    subtitle: 'El Perú y San Martín albergan la mayor diversidad de lepidópteros del planeta.',
  },
  {
    src: '/tarapoto/flora-heliconia-amazonica.webp',
    tag: 'FLORA TROPICAL',
    title: 'Heliconias y Orquídeas',
    subtitle: 'Especies botánicas amazónicas que inspiran el paisajismo de Flamingo Residencial.',
  },
  {
    src: '/tarapoto/laguna-azul-sauce.webp',
    tag: 'BIENESTAR Y RECREACIÓN',
    title: 'Laguna Azul de Sauce',
    subtitle: 'Paraíso lacustre que impulsa la alta valorización turística e inmobiliaria regional.',
  },
];

export const HomeExperience: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Official Masterplan State (Manzanas A-H, 68 lots)
  const [selectedBlockId, setSelectedBlockId] = useState<string>(OFFICIAL_BLOCKS[0]?.id || 'A');
  const [selectedLotId, setSelectedLotId] = useState<string>(
    OFFICIAL_BLOCKS[0]?.lots[0]?.id || 'A-01'
  );
  const [planViewMode, setPlanViewMode] = useState<'blueprint' | 'render'>('blueprint');

  // Active card for mobile tap support on "Una vida sin filtros"
  const [activeCardId, setActiveCardId] = useState<string>(SELVA_PROFUNDA_CARDS[0].id);

  // Contact Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadInterest, setLeadInterest] = useState('Lote de 160 m² (8m × 20m)');
  const [leadContactMethod, setLeadContactMethod] = useState('WhatsApp directo');

  const currentBlock =
    OFFICIAL_BLOCKS.find((b) => b.id === selectedBlockId) || OFFICIAL_BLOCKS[0];
  const currentLot =
    currentBlock.lots.find((l) => l.id === selectedLotId) || currentBlock.lots[0];

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
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
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

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hola Flamingo Residencial, mi nombre es ${
      leadName || 'Interesado'
    } (${leadPhone || 'sin número'}). Estoy interesado en: ${leadInterest} en Tarapoto. Preferencia de contacto: ${leadContactMethod}.`;
    window.open(buildFlamingoWhatsAppUrl(0, msg), '_blank', 'noopener,noreferrer');
  };

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    const blk = OFFICIAL_BLOCKS.find((b) => b.id === blockId);
    if (blk && blk.lots.length > 0) {
      setSelectedLotId(blk.lots[0].id);
    }
  };

  return (
    <div
      id="top"
      ref={rootRef}
      className="relative w-full min-h-screen bg-white text-[#23112B] font-dm overflow-x-hidden"
    >
      {/* =====================================================================
          1. HERO & PINNED 150-FRAME CANVAS SEQUENCE
         ===================================================================== */}
      <CanvasScrollSequence onNavigate={handleNavigate} />

      {/* =====================================================================
          2. FRANJA DE CONEXIÓN INMEDIATA (INSPIRADO EN SELVA PROFUNDA)
         ===================================================================== */}
      <section className="bg-[#361D42] text-[#F5F1FA] py-12 px-6 sm:px-14 lg:px-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 gsap-editorial-reveal">
          <div className="max-w-xl space-y-2 text-center lg:text-left">
            <span className="font-dm text-[11px] font-bold uppercase tracking-[0.26em] text-[#F48FB1]">
              PREVENTA EXCLUSIVA EN TARAPOTO
            </span>
            <h2 className="font-geista font-normal text-2xl sm:text-3xl text-white leading-snug">
              Conéctate con tu futuro en la Amazonía. Recibe el plano oficial y precios de preventa.
            </h2>
          </div>

          <form
            onSubmit={handleLeadSubmit}
            className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="text"
              placeholder="Tu nombre"
              aria-label="Tu nombre"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="rounded-full bg-white/10 border border-white/25 px-5 py-3 font-dm text-sm text-white placeholder:text-white/60 focus:border-[#F48FB1] focus:outline-none"
            />
            <input
              type="tel"
              placeholder="WhatsApp / Celular"
              aria-label="WhatsApp o Celular"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className="rounded-full bg-white/10 border border-white/25 px-5 py-3 font-dm text-sm text-white placeholder:text-white/60 focus:border-[#F48FB1] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] px-7 py-3 font-dm text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer shrink-0"
            >
              Recibir Plano
            </button>
          </form>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN "NOSOTROS" · LOGO RECONSTRUIDO + MANIFIESTO (SELVA PROFUNDA)
         ===================================================================== */}
      <section id="nosotros" className="bg-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-4xl mx-auto text-center space-y-10 gsap-editorial-reveal">
          <img
            src={FLAMINGO_BRAND.logos.darkText}
            alt="Flamingo Residencial · Logo Oficial Reconstruido"
            className="h-36 sm:h-44 w-auto object-contain mx-auto drop-shadow-sm"
          />

          <div className="space-y-4">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.26em] text-[#515B1B]">
              BIENVENIDO A TU SANTUARIO EN TARAPOTO
            </span>
            <h2 className="font-geista font-normal text-3xl sm:text-5xl text-[#361D42] leading-[1.12]">
              <span>No solo ofrecemos lotes; creamos un estilo de vida en armonía con la </span>
              <span className="italic text-[#EE6B96]">naturaleza amazónica</span>
            </h2>
          </div>

          <div className="space-y-6 font-dm text-base sm:text-lg text-[#361D42]/85 leading-relaxed">
            <p>
              Ubicado en <strong>Prolongación Jr. Cuzco s/n, Tarapoto</strong>, a tan solo{' '}
              <strong>30 metros del Colegio Virgen Dolorosa</strong> y resguardado por el horizonte
              verde de la <strong>Cordillera Escalera</strong>, <strong>Flamingo Residencial</strong>{' '}
              integra la tranquilidad de la selva alta con la cercanía inmediata a la ciudad.
            </p>
            <p>
              Nuestro proyecto cuenta con lotes amplios de <strong>160 m² y 200 m²</strong>,{' '}
              <strong>título de propiedad independizado</strong>, <strong>entrega inmediata</strong>{' '}
              y redes ejecutadas de <strong>agua potable, desagüe y alumbrado público</strong>. Es
              el lugar donde tu patrimonio familiar crece junto al destino más vibrante de San
              Martín.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. VIDEO DOCUMENTAL DE TARAPOTO + COMPARADOR DE OBRA REAL
         ===================================================================== */}
      <RealProjectShowcase />

      {/* =====================================================================
          5. SECCIÓN "SANTUARIO RESIDENCIAL & MASTERPLAN OFICIAL" (68 LOTES A-H)
             (Estructura de 2 columnas inspirada en Selva Profunda)
         ===================================================================== */}
      <section id="lotizador-360" className="bg-white py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Header Editorial */}
          <div className="max-w-3xl mx-auto text-center space-y-4 gsap-editorial-reveal">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.26em] text-[#515B1B]">
              PLANO OFICIAL Y LOTIZACIÓN INDEPENDIZADA
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42]">
              <span>Santuario Residencial y </span>
              <span className="italic text-[#EE6B96]">Masterplan</span>
            </h2>
            <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
              Explora las <strong>8 manzanas (A hasta H)</strong> y los{' '}
              <strong>{OFFICIAL_LOT_COUNT} lotes residenciales</strong> de{' '}
              <strong>160 m² y 200 m²</strong> trazados sobre nuestro plano oficial en Tarapoto.
            </p>
          </div>

          {/* 2-Column Official Masterplan + Specifications List */}
          <div
            id="plano-lotes"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start gsap-editorial-reveal"
          >
            {/* Left 7 Columns: Interactive Official Blueprint / Clean 3D Render */}
            <div className="lg:col-span-7 space-y-4">
              {/* View Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F1FA] p-2.5 rounded-2xl border border-[#361D42]/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanViewMode('blueprint')}
                    className={`rounded-xl px-4 py-2 font-dm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      planViewMode === 'blueprint'
                        ? 'bg-[#361D42] text-white'
                        : 'text-[#361D42]/75 hover:bg-[#EAE3F2]'
                    }`}
                  >
                    Plano Oficial ({OFFICIAL_LOT_COUNT} Lotes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanViewMode('render')}
                    className={`rounded-xl px-4 py-2 font-dm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      planViewMode === 'render'
                        ? 'bg-[#361D42] text-white'
                        : 'text-[#361D42]/75 hover:bg-[#EAE3F2]'
                    }`}
                  >
                    Render Arquitectónico 3D
                  </button>
                </div>

                <span className="font-dm text-xs font-semibold text-[#515B1B] px-2">
                  Haz clic en cualquier manzana o lote
                </span>
              </div>

              {/* Interactive Stage */}
              <div className="relative w-full overflow-hidden rounded-3xl bg-[#23112B] border border-[#361D42]/15 shadow-xl">
                {planViewMode === 'blueprint' ? (
                  <div className="relative w-full aspect-[1034/1272] max-h-[760px] mx-auto">
                    <img
                      src="/urbanization/flamingo-lots-plan.webp"
                      alt="Plano Oficial de Lotes · Flamingo Residencial Tarapoto"
                      className="h-full w-full object-contain bg-[#2B1636]"
                    />
                    <svg
                      viewBox={`0 0 ${PLAN_WIDTH} ${PLAN_HEIGHT}`}
                      className="absolute inset-0 h-full w-full"
                    >
                      {/* Public Recreation Area H-08 */}
                      <path
                        d={PUBLIC_RECREATION.path}
                        fill="rgba(81, 91, 27, 0.28)"
                        stroke="#A3E635"
                        strokeWidth="2"
                      />

                      {/* Blocks A-H and Individual Lots */}
                      {OFFICIAL_BLOCKS.map((block) => {
                        const isBlockSelected = block.id === currentBlock.id;
                        return (
                          <g key={block.id}>
                            <path
                              d={block.path}
                              fill={
                                isBlockSelected
                                  ? 'rgba(238, 107, 150, 0.12)'
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
                                      ? 'rgba(238, 107, 150, 0.68)'
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
                            {/* Block Badge */}
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
                ) : (
                  <div className="relative w-full aspect-[1280/1048]">
                    <img
                      src="/urbanization/flamingo-render-clean.webp"
                      alt="Render Oficial 3D · Flamingo Residencial Tarapoto"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Bottom Selected Lot Info Bar */}
                <div className="bg-white/95 backdrop-blur-md p-5 border-t border-[#361D42]/10 flex flex-wrap items-center justify-between gap-4 text-[#23112B]">
                  <div>
                    <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-[#515B1B] block">
                      {`MANZANA ${currentBlock.letter} · LOTE ${currentLot?.number || '01'}`}
                    </span>
                    <p className="font-geista text-2xl text-[#361D42]">
                      {currentLot?.areaSqm
                        ? `Área oficial: ${currentLot.areaSqm} m² · Con Título de Propiedad`
                        : 'Lote Residencial · Con Título de Propiedad'}
                    </p>
                  </div>
                  <a
                    href={buildFlamingoWhatsAppUrl(
                      0,
                      `Hola Flamingo Residencial, deseo cotizar el Lote ${currentLot?.number} de la Manzana ${currentBlock.letter} (${
                        currentLot?.areaSqm ? `${currentLot.areaSqm} m²` : '160 m² / 200 m²'
                      }) en Tarapoto.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#361D42] px-6 py-3 font-dm text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#EE6B96] hover:text-[#23112B] transition-colors"
                  >
                    Cotizar este Lote
                  </a>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Block & Lot Selector + Selva Profunda Bulleted Features */}
            <div className="lg:col-span-5 space-y-8">
              {/* Interactive Manzana Selector */}
              <div className="bg-[#F5F1FA] p-6 rounded-3xl border border-[#361D42]/10 space-y-5">
                <div className="space-y-2">
                  <span className="font-dm text-xs font-bold uppercase tracking-[0.2em] text-[#515B1B]">
                    SELECCIONA UNA MANZANA (A - H)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {OFFICIAL_BLOCKS.map((blk) => {
                      const active = blk.id === currentBlock.id;
                      return (
                        <button
                          key={blk.id}
                          type="button"
                          onClick={() => {
                            setPlanViewMode('blueprint');
                            handleSelectBlock(blk.id);
                          }}
                          className={`rounded-xl py-2.5 px-3 font-dm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            active
                              ? 'bg-[#EE6B96] text-[#23112B] shadow-sm'
                              : 'bg-white text-[#361D42] hover:bg-[#EAE3F2]'
                          }`}
                        >
                          {`Mz ${blk.letter} (${blk.lots.length})`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lots within Selected Manzana */}
                <div className="space-y-2 pt-2 border-t border-[#361D42]/10">
                  <span className="font-dm text-xs font-bold uppercase tracking-[0.18em] text-[#361D42]/75">
                    {`Lotes en Manzana ${currentBlock.letter}:`}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentBlock.lots.map((lot) => {
                      const active = lot.id === currentLot?.id;
                      return (
                        <button
                          key={lot.id}
                          type="button"
                          onClick={() => {
                            setPlanViewMode('blueprint');
                            setSelectedLotId(lot.id);
                          }}
                          className={`rounded-lg px-3 py-1.5 font-dm text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#361D42] text-white'
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

              {/* Selva Profunda Style Bulleted Specifications */}
              <div className="space-y-5 px-1">
                <h3 className="font-geista text-3xl text-[#515B1B]">
                  Áreas comunes y equipamiento:
                </h3>
                <ul className="space-y-3 font-dm text-base text-[#361D42]/85">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Lotes residenciales de 160 m² (8m × 20m) y 200 m² (10m × 20m)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>
                      Área de recreación pública central ({PUBLIC_RECREATION.areaSqm} m²) con
                      cancha deportiva y pérgolas
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Pórtico monumental de ingreso en piedra laja y madera</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Alameda central arborizada con palmeras reales conservadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Red de Agua Potable con cajas domiciliarias instaladas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Red de Desagüe, buzones sanitarios y Alumbrado Público</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>Título de propiedad independizado y Entrega Inmediata</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#EE6B96] shrink-0" />
                    <span>
                      Ubicación privilegiada en Prolongación Jr. Cuzco s/n, a 30m del Colegio
                      Virgen Dolorosa, Tarapoto
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Embedded Real 360° Aerial Viewer */}
          <div className="pt-8 space-y-8 gsap-editorial-reveal">
            <div className="text-center space-y-2">
              <span className="font-dm text-xs font-bold uppercase tracking-[0.24em] text-[#515B1B]">
                RECORRIDO VIRTUAL INTERACTIVO
              </span>
              <h3 className="font-geista font-normal text-3xl sm:text-5xl text-[#361D42]">
                <span>Masterplan Interactivo </span>
                <span className="italic text-[#EE6B96]">360° en Terreno</span>
              </h3>
              <p className="font-dm text-sm text-[#361D42]/75">
                8 capturas esféricas reales tomadas con dron sobre Flamingo Residencial en Tarapoto
              </p>
            </div>
            <Real360AerialViewer />
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. SECCIÓN "UNA VIDA SIN FILTROS: TARAPOTO, CORDILLERA ESCALERA Y BIODIVERSIDAD"
             (Las 4 tarjetas interactivas de Selva Profunda + Galería de Fauna y Flora)
         ===================================================================== */}
      <section
        id="tarapoto-maravillas"
        className="bg-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Editorial Intro */}
          <div className="max-w-3xl mx-auto text-center space-y-4 gsap-editorial-reveal">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.26em] text-[#515B1B]">
              NATURALEZA, TURISMO, FAUNA Y FLORA DE SAN MARTÍN
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42] leading-[1.08]">
              <span>Una vida sin filtros en el paraíso de </span>
              <span className="italic text-[#EE6B96]">Tarapoto</span>
            </h2>
            <p className="font-dm text-base sm:text-lg text-[#361D42]/80 leading-relaxed">
              En Flamingo Residencial cada día te conecta con la majestuosidad de la Cordillera
              Escalera, sus cataratas cristalinas y la riqueza biológica de la Alta Amazonía.
            </p>
          </div>

          {/* 4 Interactive Hover-Reveal Cards (Exact Selva Profunda "Una vida sin filtros" experience) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gsap-editorial-reveal">
            {SELVA_PROFUNDA_CARDS.map((card) => {
              const isSelected = activeCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setActiveCardId(card.id)}
                  onMouseEnter={() => setActiveCardId(card.id)}
                  className="group relative h-[470px] sm:h-[510px] w-full overflow-hidden rounded-3xl bg-[#23112B] cursor-pointer shadow-lg"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    style={{ objectPosition: card.objectPosition || '50% 50%' }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isSelected
                        ? 'bg-gradient-to-t from-[#23112B]/95 via-[#23112B]/65 to-[#23112B]/20'
                        : 'bg-gradient-to-t from-[#23112B]/90 via-[#23112B]/35 to-transparent'
                    }`}
                  />

                  <div className="relative z-10 h-full flex flex-col justify-end p-7 text-white">
                    <span className="font-dm text-[11px] font-bold uppercase tracking-[0.24em] text-[#F48FB1] mb-2">
                      {card.eyebrow}
                    </span>
                    <h3 className="font-geista font-normal text-2xl sm:text-3xl text-white leading-snug">
                      {card.title}
                    </h3>

                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isSelected
                          ? 'max-h-60 opacity-100 mt-3'
                          : 'max-h-0 opacity-0 group-hover:max-h-60 group-hover:opacity-100 group-hover:mt-3'
                      }`}
                    >
                      <p className="font-dm text-sm text-[#EAE3F2]/90 leading-relaxed mb-5">
                        {card.description}
                      </p>
                      <a
                        href={buildFlamingoWhatsAppUrl(0, card.whatsappMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-full bg-[#EE6B96] hover:bg-[#F48FB1] text-[#23112B] px-5 py-2.5 font-dm text-xs font-bold uppercase tracking-[0.16em] transition-colors"
                      >
                        <span>{card.ctaLabel}</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Biodiversity & Tourism Mosaic (Fauna, Flora, Cordillera Escalera & Turismo) */}
          <div className="space-y-8 pt-6 gsap-editorial-reveal">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#361D42]/12 pb-6">
              <div>
                <span className="font-dm text-xs font-bold uppercase tracking-[0.24em] text-[#515B1B]">
                  PATRIMONIO NATURAL DE TARAPOTO
                </span>
                <h3 className="font-geista font-normal text-3xl sm:text-4xl text-[#361D42] mt-1">
                  Fauna, Flora y Paisajes de la Cordillera Escalera
                </h3>
              </div>
              <p className="font-dm text-sm text-[#361D42]/75 max-w-md">
                Fotografías reales verificadas del ecosistema que rodea la provincia de San Martín y
                embellece la vida en Tarapoto.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {BIODIVERSITY_GALLERY.map((item) => (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-2xl bg-white border border-[#361D42]/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#EAE3F2]">
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <span className="font-dm text-[10px] font-bold uppercase tracking-[0.22em] text-[#EE6B96]">
                      {item.tag}
                    </span>
                    <h4 className="font-geista text-2xl text-[#23112B]">{item.title}</h4>
                    <p className="font-dm text-xs sm:text-sm text-[#361D42]/75 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. SECCIÓN "UBICACIÓN ESTRATÉGICA EN TARAPOTO" (MAPA REAL)
         ===================================================================== */}
      <section id="ubicacion" className="bg-white py-24 sm:py-28 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center gsap-editorial-reveal">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.24em] text-[#515B1B]">
              CONECTIVIDAD Y PLUSVALÍA EN TARAPOTO
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-5xl text-[#361D42] leading-[1.08]">
              <span>A 30 metros del </span>
              <span className="italic text-[#EE6B96]">Colegio Virgen Dolorosa</span>
            </h2>
            <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
              Encuéntranos en <strong>Prolongación Jr. Cuzco s/n, Tarapoto</strong>. Una ubicación
              residencial privilegiada que combina tranquilidad, brisa de montaña y acceso rápido a
              colegios, comercios y el aeropuerto de Tarapoto.
            </p>

            <div className="space-y-3 pt-2 font-dm text-sm text-[#361D42]">
              <div className="rounded-2xl bg-[#F5F1FA] p-4 border border-[#361D42]/10">
                <strong className="block text-[#23112B]">Referencia directa:</strong>
                <span>Prolongación Jr. Cuzco s/n, a 30 metros del Colegio Virgen Dolorosa</span>
              </div>
              <div className="rounded-2xl bg-[#F5F1FA] p-4 border border-[#361D42]/10">
                <strong className="block text-[#23112B]">Coordenadas GPS del proyecto:</strong>
                <span>6°30&apos;17.2&quot;S 76°21&apos;27.3&quot;W (-6.504788, -76.357580)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={buildFlamingoWhatsAppUrl(
                  0,
                  'Hola Flamingo Residencial, deseo agendar una visita guiada al proyecto en Prolongación Jr. Cuzco s/n (a 30m del Colegio Virgen Dolorosa, Tarapoto).'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white hover:text-[#23112B] px-7 py-3.5 font-dm text-xs font-bold uppercase tracking-[0.18em] transition-colors"
              >
                <span>Agendar Visita Guiada</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 overflow-hidden rounded-3xl border border-[#361D42]/15 shadow-xl bg-[#EAE3F2] aspect-[16/11]">
            <iframe
              title="Ubicación de Flamingo Residencial en Tarapoto"
              src="https://www.google.com/maps?q=-6.5047877,-76.3575799&z=17&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. SECCIÓN "CONTACTO & PREVENTA" (ESTILO SELVA PROFUNDA + FLAMINGO)
         ===================================================================== */}
      <section id="contacto" className="bg-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-5xl mx-auto space-y-12 gsap-editorial-reveal">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.26em] text-[#EE6B96]">
              APROVECHA LA PREVENTA EN TARAPOTO
            </span>
            <h2 className="font-geista font-normal text-4xl sm:text-6xl text-[#361D42]">
              <span>Separa tu lote </span>
              <span className="italic text-[#EE6B96]">hoy mismo</span>
            </h2>
            <p className="font-dm text-base text-[#361D42]/80">
              Déjanos tus datos para enviarte el plano actualizado de lotes de{' '}
              <strong>160 m² y 200 m²</strong> o comunícate directamente con nuestra central de
              preventa al <strong>{FLAMINGO_BRAND.contact.phoneDisplay}</strong>.
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="flamingo-name"
                  className="block font-dm text-sm text-[#361D42]/85 pl-2"
                >
                  Nombre y apellido
                </label>
                <input
                  id="flamingo-name"
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full rounded-full border border-[#361D42]/35 bg-white px-6 py-3.5 font-dm text-sm text-[#23112B] focus:border-[#361D42] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="flamingo-phone"
                  className="block font-dm text-sm text-[#361D42]/85 pl-2"
                >
                  Celular / WhatsApp
                </label>
                <input
                  id="flamingo-phone"
                  type="tel"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full rounded-full border border-[#361D42]/35 bg-white px-6 py-3.5 font-dm text-sm text-[#23112B] focus:border-[#361D42] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="flamingo-interest"
                  className="block font-dm text-sm text-[#361D42]/85 pl-2"
                >
                  Interés principal
                </label>
                <select
                  id="flamingo-interest"
                  value={leadInterest}
                  onChange={(e) => setLeadInterest(e.target.value)}
                  className="w-full rounded-full border border-[#361D42]/35 bg-white px-6 py-3.5 font-dm text-sm text-[#23112B] focus:border-[#361D42] focus:outline-none"
                >
                  <option value="Lote de 160 m² (8m × 20m)">Lote de 160 m² (8m × 20m)</option>
                  <option value="Lote de 200 m² (10m × 20m)">Lote de 200 m² (10m × 20m)</option>
                  <option value="Visita guiada al proyecto en Tarapoto">
                    Visita guiada al proyecto en Tarapoto
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="flamingo-method"
                  className="block font-dm text-sm text-[#361D42]/85 pl-2"
                >
                  ¿Cómo prefieres ser contactado?
                </label>
                <select
                  id="flamingo-method"
                  value={leadContactMethod}
                  onChange={(e) => setLeadContactMethod(e.target.value)}
                  className="w-full rounded-full border border-[#361D42]/35 bg-white px-6 py-3.5 font-dm text-sm text-[#23112B] focus:border-[#361D42] focus:outline-none"
                >
                  <option value="WhatsApp directo">WhatsApp directo</option>
                  <option value="Llamada telefónica">Llamada telefónica</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="submit"
                className="rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white hover:text-[#23112B] px-12 py-4 font-dm text-sm font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>

          {/* Direct Channels Bar */}
          <div className="pt-8 border-t border-[#361D42]/12 flex flex-wrap items-center justify-center gap-6 text-sm font-dm text-[#361D42]">
            <a
              href={buildFlamingoWhatsAppUrl(0)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:text-[#EE6B96] transition-colors"
            >
              WhatsApp: {FLAMINGO_BRAND.contact.phoneDisplay}
            </a>
            <span className="text-[#361D42]/30">·</span>
            <a
              href={`mailto:${FLAMINGO_BRAND.contact.email}`}
              className="font-medium hover:text-[#EE6B96] transition-colors"
            >
              {FLAMINGO_BRAND.contact.email}
            </a>
            <span className="text-[#361D42]/30">·</span>
            <a
              href={FLAMINGO_BRAND.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-[#EE6B96] transition-colors"
            >
              Instagram {FLAMINGO_BRAND.contact.handle}
            </a>
            <span className="text-[#361D42]/30">·</span>
            <a
              href={FLAMINGO_BRAND.contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-[#EE6B96] transition-colors"
            >
              Facebook Oficial
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. FOOTER EDITORIAL EN CIRUELA PROFUNDO (#361D42)
         ===================================================================== */}
      <footer className="bg-[#361D42] text-[#F5F1FA] py-16 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="space-y-3">
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-24 w-auto object-contain"
            />
            <p className="font-dm text-xs uppercase tracking-[0.22em] text-[#EAE3F2]/80">
              Lotes de 160 m² y 200 m² · Con Título de Propiedad · ¡Entrega Inmediata!
            </p>
            <p className="font-dm text-xs text-[#EAE3F2]/65">
              Prolongación Jr. Cuzco s/n, a 30 metros del Colegio Virgen Dolorosa · Tarapoto, San
              Martín
            </p>
          </div>

          <div className="space-y-4">
            <span className="block font-dm text-xs uppercase tracking-[0.22em] text-[#F48FB1] font-bold">
              Central de Preventa · {FLAMINGO_BRAND.contact.handle}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {WHATSAPP_ADVISORS.map((adv, idx) => (
                <a
                  key={adv.id}
                  href={buildFlamingoWhatsAppUrl(idx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#F5F1FA]/40 px-6 py-3 font-dm text-sm font-bold tracking-[0.16em] text-white hover:bg-[#EE6B96] hover:border-[#EE6B96] hover:text-[#23112B] transition-colors"
                >
                  {adv.displayPhone}
                </a>
              ))}
              <a
                href={`mailto:${FLAMINGO_BRAND.contact.email}`}
                className="rounded-full border border-[#F5F1FA]/25 px-5 py-3 font-dm text-xs font-medium tracking-wider text-[#EAE3F2] hover:bg-white/10 transition-colors"
              >
                {FLAMINGO_BRAND.contact.email}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-dm text-[#EAE3F2]/80">
              <a
                href={FLAMINGO_BRAND.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F48FB1] transition-colors underline underline-offset-4"
              >
                Instagram · @inmobiliaria.flamingo
              </a>
              <a
                href={FLAMINGO_BRAND.contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F48FB1] transition-colors underline underline-offset-4"
              >
                Facebook · Inmobiliaria Flamingo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
