import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  buildFlamingoWhatsAppUrl,
  FLAMINGO_BRAND,
  WHATSAPP_ADVISORS,
} from '../config/flamingo';
import { CanvasScrollSequence } from './CanvasScrollSequence';
import { Real360AerialViewer } from './Real360AerialViewer';
import { RealProjectShowcase } from './RealProjectShowcase';

gsap.registerPlugin(ScrollTrigger);

interface LotPolygonItem {
  id: string;
  code: string;
  areaSqm: 160 | 200;
  dimensions: string;
  location: string;
  points: string;
  center: { x: number; y: number };
}

const MASTERPLAN_LOTS: LotPolygonItem[] = [
  {
    id: 'mz-a1',
    code: 'Mz A · Lote 01',
    areaSqm: 200,
    dimensions: '10m × 20m',
    location: 'Esquina frente a parque central',
    points: '540,582 615,568 688,595 612,612',
    center: { x: 614, y: 589 },
  },
  {
    id: 'mz-a2',
    code: 'Mz A · Lote 02',
    areaSqm: 160,
    dimensions: '8m × 20m',
    location: 'Avenida Principal',
    points: '618,567 692,553 764,579 690,594',
    center: { x: 691, y: 573 },
  },
  {
    id: 'mz-b1',
    code: 'Mz B · Lote 01',
    areaSqm: 200,
    dimensions: '10m × 20m',
    location: 'Esquina frente a alameda',
    points: '692,632 782,612 868,642 778,664',
    center: { x: 780, y: 638 },
  },
  {
    id: 'mz-b2',
    code: 'Mz B · Lote 02',
    areaSqm: 160,
    dimensions: '8m × 20m',
    location: 'Calle residencial interna',
    points: '785,611 872,592 956,620 870,641',
    center: { x: 871, y: 616 },
  },
  {
    id: 'mz-b3',
    code: 'Mz B · Lote 03',
    areaSqm: 200,
    dimensions: '10m × 20m',
    location: 'Avenida Principal',
    points: '875,591 962,572 1045,598 958,619',
    center: { x: 960, y: 595 },
  },
  {
    id: 'mz-c1',
    code: 'Mz C · Lote 01',
    areaSqm: 160,
    dimensions: '8m × 20m',
    location: 'Frente a calle vehicular',
    points: '995,562 1098,542 1192,568 1088,590',
    center: { x: 1093, y: 565 },
  },
];

export const HomeExperience: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectedLot, setSelectedLot] = useState<LotPolygonItem>(MASTERPLAN_LOTS[0]);

  // Contact Form State (Selva Profunda clean 2-col format)
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadInterest, setLeadInterest] = useState('Lote de 160 m² (8m × 20m)');
  const [leadContactMethod, setLeadContactMethod] = useState('WhatsApp directo');

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
    } (${leadPhone || 'sin número'}). Estoy interesado en: ${leadInterest}. Preferencia de contacto: ${leadContactMethod}.`;
    window.open(buildFlamingoWhatsAppUrl(0, msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="top"
      ref={rootRef}
      className="relative w-full min-h-screen bg-white text-[#23112B] font-dm overflow-x-hidden"
    >
      {/* =====================================================================
          1. HERO & PINNED 150-FRAME CANVAS SEQUENCE (PERUBUILDS ARCHITECTURE)
         ===================================================================== */}
      <CanvasScrollSequence onNavigate={handleNavigate} />

      {/* =====================================================================
          2. SECCIÓN "NOSOTROS" — MANIFIESTO EDITORIAL (SELVA PROFUNDA STYLE)
         ===================================================================== */}
      <section id="nosotros" className="bg-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-4xl mx-auto text-center space-y-10 gsap-editorial-reveal">
          <img
            src={FLAMINGO_BRAND.logos.darkText}
            alt="Flamingo Residencial"
            className="h-28 sm:h-32 w-auto object-contain mx-auto"
          />

          <div className="space-y-6 font-dm text-base sm:text-lg text-[#361D42]/85 leading-relaxed">
            <p>
              No solo urbanizamos terrenos; consolidamos el patrimonio de tu familia en un entorno
              planificado y seguro. <strong>Flamingo Residencial</strong> nace a solo{' '}
              <strong>30 metros del Colegio Virgen Dolorosa</strong>, integrando lotes amplios de{' '}
              <strong>160 m² y 200 m²</strong> con habilitación urbana completa.
            </p>
            <p>
              Respaldados con <strong>título de propiedad</strong> y{' '}
              <strong>entrega inmediata</strong>, desarrollamos una comunidad con pórtico de ingreso
              construido y redes ejecutadas de <strong>agua, desagüe y alumbrado público</strong>.
              Aquí, tu lote es el inicio de tu legado familiar.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECCIÓN "NUESTRO PROYECTO" & "ALEDAÑOS" (PERUBUILDS LAYOUT + DRIVE)
         ===================================================================== */}
      <RealProjectShowcase />

      {/* =====================================================================
          4. SECCIÓN "SERVICIOS / NUESTRO ENFOQUE" (PERUBUILDS 4 STAGGERED SQUARES)
         ===================================================================== */}
      <section
        id="servicios"
        className="bg-[#F5F1FA] pt-24 pb-28 px-6 sm:px-14 lg:px-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          {/* 4 Staggered Architectural Squares (Exact PeruBuilds ref_perubuilds_04.png) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 items-start gsap-editorial-reveal">
            {/* Square 1: Agua Potable */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-xl bg-[#361D42] flex items-center justify-center p-10">
                <svg viewBox="0 0 120 120" className="w-28 h-28 text-white" fill="none">
                  <path
                    d="M16 46L38 26L60 46L82 26L104 46"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="square"
                  />
                  <path
                    d="M16 78L38 58L60 78L82 58L104 78"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-dm font-bold text-lg text-[#23112B]">Agua Potable</h3>
                <p className="font-dm text-xs text-[#361D42]/70">
                  Cajas de registro domiciliarias en terreno
                </p>
              </div>
            </div>

            {/* Square 2: Desagüe (Staggered down) */}
            <div className="space-y-4 lg:mt-10">
              <div className="aspect-square w-full rounded-xl bg-[#515B1B] flex items-center justify-center p-10">
                <svg viewBox="0 0 120 120" className="w-28 h-28 text-white" fill="none">
                  <path
                    d="M40 96V28M22 46L40 26L58 46M22 70L40 50L58 70"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="square"
                  />
                  <path
                    d="M80 96V28M62 46L80 26L98 46M62 70L80 50L98 70"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-dm font-bold text-lg text-[#23112B]">Red de Desagüe</h3>
                <p className="font-dm text-xs text-[#361D42]/70">
                  Buzones y colectores sanitarios ejecutados
                </p>
              </div>
            </div>

            {/* Square 3: Alumbrado Público (Staggered further down) */}
            <div className="space-y-4 lg:mt-20">
              <div className="aspect-square w-full rounded-xl bg-[#EE6B96] flex items-center justify-center p-10">
                <svg viewBox="0 0 120 120" className="w-28 h-28 text-white" fill="none">
                  <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="11" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-dm font-bold text-lg text-[#23112B]">Alumbrado Público</h3>
                <p className="font-dm text-xs text-[#361D42]/70">
                  Iluminación vial en avenidas y parques
                </p>
              </div>
            </div>

            {/* Square 4: Título de Propiedad (Staggered furthest down) */}
            <div className="space-y-4 lg:mt-32">
              <div className="aspect-square w-full rounded-xl bg-[#EAE3F2] border border-[#361D42]/10 flex items-center justify-center p-10">
                <svg viewBox="0 0 120 120" className="w-28 h-28 text-[#361D42]" fill="none">
                  <path
                    d="M60 18L102 60L60 102L18 60L60 18Z"
                    stroke="currentColor"
                    strokeWidth="10"
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-dm font-bold text-lg text-[#23112B]">Título de Propiedad</h3>
                <p className="font-dm text-xs text-[#361D42]/70">
                  Independización legal y entrega inmediata
                </p>
              </div>
            </div>
          </div>

          {/* Giant PeruBuilds Display Footer: "nuestro ENFOQUE INMOBILIARIO" */}
          <div className="mt-20 pt-8 border-t border-[#361D42]/10 flex flex-col items-end text-right select-none gsap-editorial-reveal">
            <div className="w-full flex flex-wrap items-baseline justify-between gap-4 leading-none">
              <span className="font-geista italic font-normal text-6xl sm:text-8xl lg:text-[7rem] text-[#361D42]/15">
                nuestro
              </span>
              <span className="font-dm font-extrabold text-5xl sm:text-7xl lg:text-[6.5rem] tracking-tight text-[#361D42] uppercase">
                ENFOQUE
              </span>
            </div>
            <span className="font-dm font-extrabold text-4xl sm:text-6xl lg:text-[5.5rem] tracking-tight text-[#515B1B] uppercase leading-none mt-2">
              INMOBILIARIO
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SECCIÓN "MASTERPLAN & LOTIZADOR 360°" (SELVA PROFUNDA ARCHITECTURE)
         ===================================================================== */}
      <section id="lotizador-360" className="bg-white py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Header (Selva Profunda "Santuario Privado" style) */}
          <div className="max-w-3xl mx-auto text-center space-y-4 gsap-editorial-reveal">
            <h2 className="font-dm font-semibold text-3xl sm:text-5xl text-[#515B1B]">
              Masterplan & Lotización
            </h2>
            <p className="font-dm text-base text-[#361D42]/80 leading-relaxed">
              Lotes residenciales de <strong>160 m² y 200 m²</strong> con parámetros pensados para
              asegurar amplitud, iluminación natural y alta valorización a solo 30 metros del
              Colegio Virgen Dolorosa.
            </p>
          </div>

          {/* 2-Column Masterplan + Specifications List (Selva Profunda ref_selva_03.png) */}
          <div
            id="plano-lotes"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center gsap-editorial-reveal"
          >
            {/* Left 7 Columns: Clean Masterplan SVG Map */}
            <div className="lg:col-span-7 relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#23112B]">
              <img
                src="/flow-frames/stage-75.jpg"
                alt="Masterplan de Flamingo Residencial"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#23112B]/20 pointer-events-none" />

              <svg
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full"
              >
                <polygon
                  points="422,592 1035,484 1438,538 1228,748 764,658"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeDasharray="10 6"
                  opacity="0.85"
                />
                {MASTERPLAN_LOTS.map((lot) => {
                  const active = selectedLot.id === lot.id;
                  return (
                    <g
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className="cursor-pointer"
                    >
                      <polygon
                        points={lot.points}
                        fill={active ? 'rgba(238,107,150,0.72)' : 'rgba(81,91,27,0.55)'}
                        stroke="#FFFFFF"
                        strokeWidth={active ? '3.5' : '2'}
                      />
                      <text
                        x={lot.center.x}
                        y={lot.center.y + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        {`${lot.areaSqm}m²`}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Minimalist Bottom Overlay on Masterplan */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[#23112B]">
                <div>
                  <span className="font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-[#515B1B] block">
                    {`${selectedLot.code} · ${selectedLot.dimensions}`}
                  </span>
                  <p className="font-dm text-sm font-bold">
                    {`Lote de ${selectedLot.areaSqm} m² — ${selectedLot.location}`}
                  </p>
                </div>
                <a
                  href={buildFlamingoWhatsAppUrl(
                    0,
                    `Hola Flamingo Residencial, deseo cotizar el ${selectedLot.code} de ${selectedLot.areaSqm} m² (${selectedLot.dimensions}) en preventa.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#361D42] px-5 py-2 font-dm text-xs font-bold uppercase tracking-wider text-white hover:bg-[#EE6B96] hover:text-[#23112B] transition-colors"
                >
                  Cotizar Lote
                </a>
              </div>
            </div>

            {/* Right 5 Columns: Clean Bulleted List (Exact Selva Profunda ref_selva_03.png style) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-dm font-semibold text-2xl sm:text-3xl text-[#515B1B]">
                Características del Proyecto:
              </h3>
              <ul className="space-y-3.5 font-dm text-base text-[#361D42]/85">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Lotes residenciales de 160 m² (frente de 8m × 20m de fondo)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Lotes residenciales de 200 m² (frente de 10m × 20m de fondo)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Título de propiedad independizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>¡Entrega Inmediata!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Red de Agua Potable con cajas domiciliarias</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Red de Desagüe y alcantarillado</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Alumbrado Público</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Pórtico de ingreso en piedra laja y madera</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>Parque central con alameda de palmeras</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#361D42] shrink-0" />
                  <span>A solo 30 metros del Colegio Virgen Dolorosa</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Embedded Real 360° Aerial Viewer (Selva Profunda ref_selva_04.png layout) */}
          <div className="pt-8 space-y-8 gsap-editorial-reveal">
            <div className="text-center space-y-2">
              <h3 className="font-dm font-semibold text-3xl sm:text-4xl text-[#515B1B]">
                Explorador Aéreo 360° en Terreno
              </h3>
              <p className="font-dm text-sm text-[#361D42]/75">
                8 capturas esféricas reales tomadas con dron sobre Flamingo Residencial
              </p>
            </div>
            <Real360AerialViewer />
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. SECCIÓN "CONTACTO & PREVENTA" (SELVA PROFUNDA FORM + FLAMINGO)
         ===================================================================== */}
      <section id="contacto" className="bg-[#F5F1FA] py-24 sm:py-32 px-6 sm:px-14 lg:px-20">
        <div className="max-w-5xl mx-auto space-y-12 gsap-editorial-reveal">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="font-dm text-xs font-bold uppercase tracking-[0.26em] text-[#EE6B96]">
              APROVECHA LA PREVENTA
            </span>
            <h2 className="font-geista text-4xl sm:text-6xl text-[#361D42] uppercase">
              Separa tu lote hoy
            </h2>
            <p className="font-dm text-base text-[#361D42]/80">
              Déjanos tus datos para enviarte el plano actualizado de lotes de{' '}
              <strong>160 m² y 200 m²</strong> o comunícate directamente con nuestra central de
              preventa al <strong>{FLAMINGO_BRAND.contact.phoneDisplay}</strong>.
            </p>
          </div>

          {/* Clean 2-Column Pill Form (Exact Selva Profunda ref_selva_02.png style) */}
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
                  <option value="Visita guiada al proyecto">Visita guiada al proyecto</option>
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
                Enviar
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
          7. FOOTER EDITORIAL EN CIRUELA PROFUNDO (#361D42)
         ===================================================================== */}
      <footer className="bg-[#361D42] text-[#F5F1FA] py-16 px-6 sm:px-14 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="space-y-3">
            <img
              src={FLAMINGO_BRAND.logos.lightText}
              alt="Flamingo Residencial"
              className="h-20 w-auto object-contain"
            />
            <p className="font-dm text-xs uppercase tracking-[0.22em] text-[#EAE3F2]/75">
              Lotes de 160 m² y 200 m² · Con Título de Propiedad · ¡Entrega Inmediata!
            </p>
            <p className="font-dm text-xs text-[#EAE3F2]/65">
              A solo 30 metros del Colegio Virgen Dolorosa · Agua, Desagüe y Alumbrado Público
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
